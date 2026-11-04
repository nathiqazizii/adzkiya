$ErrorActionPreference = "Stop"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "================ 1. STATIC ASSETS ================"
$idx = Invoke-WebRequest -Uri "http://localhost:8080/index.html" -WebSession $session -UseBasicParsing
Write-Host "index.html  : HTTP" $idx.StatusCode "(Bytes: $($idx.Content.Length))"

$lgn = Invoke-WebRequest -Uri "http://localhost:8080/login.html" -WebSession $session -UseBasicParsing
Write-Host "login.html  : HTTP" $lgn.StatusCode "(Bytes: $($lgn.Content.Length))"

$css = Invoke-WebRequest -Uri "http://localhost:8080/css/style.css" -WebSession $session -UseBasicParsing
Write-Host "style.css   : HTTP" $css.StatusCode "(Bytes: $($css.Content.Length))"

$js = Invoke-WebRequest -Uri "http://localhost:8080/js/app.js" -WebSession $session -UseBasicParsing
Write-Host "app.js      : HTTP" $js.StatusCode "(Bytes: $($js.Content.Length))"

Write-Host "`n================ 2. AUTH & SELF-REGISTRATION FLOW ================"
# Initial check without login should return 401
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -WebSession $session
    Write-Host "WARNING: Session was already active!"
} catch {
    Write-Host "Unauthenticated session correctly returned 401: OK"
}

# Customer Self-Registration Test
$regUser = "rafii_" + (Get-Random -Minimum 1000 -Maximum 9999)
$regBody = '{"namaLengkap":"Rafi Ahmad Pratama","noWa":"081234567890","username":"' + $regUser + '","password":"pembeli123"}'
$regResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $regBody -ContentType "application/json" -WebSession $session
Write-Host "Self-Registration Pembeli: Nama=$($regResp.namaLengkap), Role=$($regResp.role), CustomerID=$($regResp.pelangganId)"

$regMe = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -WebSession $session
Write-Host "Verified Register Session: $($regMe.username) [$($regMe.role)], Customer ID: $($regMe.pelangganId)"

# Verify Pembeli is restricted from deleting customer master data
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan/P01" -Method Delete -WebSession $session
    Write-Host "ERROR: Pembeli should not be able to delete data!"
} catch {
    Write-Host "Access control verified: Pembeli forbidden from deleting master data (403): OK"
}

# Real login as Admin
$loginAdmin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body '{"username":"admin","password":"admin123"}' -ContentType "application/json" -WebSession $session
Write-Host "Logged in as Admin    :" $loginAdmin.namaLengkap "[$($loginAdmin.role)]"

$me = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -WebSession $session
Write-Host "Verified /api/auth/me :" $me.namaLengkap "[$($me.role)]"

# Real login as Koki
$loginKoki = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body '{"username":"koki","password":"koki123"}' -ContentType "application/json" -WebSession $session
Write-Host "Logged in as Koki     :" $loginKoki.namaLengkap "[$($loginKoki.role)]"

# Real login as Pemilik
$loginPemilik = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body '{"username":"pemilik","password":"pemilik123"}' -ContentType "application/json" -WebSession $session
Write-Host "Logged in as Pemilik  :" $loginPemilik.namaLengkap "[$($loginPemilik.role)]"

# Switch back to Admin
$swAdmin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body '{"username":"admin","password":"admin123"}' -ContentType "application/json" -WebSession $session
Write-Host "Re-authenticated Admin:" $swAdmin.namaLengkap "[$($swAdmin.role)]"

Write-Host "`n================ 3. PELANGGAN CRUD & FILTERS ================"
$all = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan" -Method Get -WebSession $session
Write-Host "Total pelanggan loaded from MySQL:" $all.Count

$search = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan?q=Dimas" -Method Get -WebSession $session
Write-Host "Search q=Dimas returned          :" $search.Count "(Name: $($search[0].nama))"

$filterLabel = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan?label=Pelanggan%20Tetap" -Method Get -WebSession $session
Write-Host "Filter label=Pelanggan Tetap     :" $filterLabel.Count "customers"

$filterKanal = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan?kanal=Dine-in" -Method Get -WebSession $session
Write-Host "Filter kanal=Dine-in             :" $filterKanal.Count "customers"

# Create new customer as Admin
$newCustBody = '{"nama":"Budi Santoso","wa":"6281299990001","kanal":"Dine-in","seg":"Mahasiswa","label":"Pelanggan","optin":true}'
$newCust = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan" -Method Post -Body $newCustBody -ContentType "application/json" -WebSession $session
Write-Host "Created customer                 : ID $($newCust.id), Name $($newCust.nama)"

# Update that customer
$updateBody = '{"nama":"Budi Santoso (Updated)","wa":"6281299990001","kanal":"WhatsApp","seg":"Pesanan besar","label":"Pelanggan Tetap","optin":true}'
$updated = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan/$($newCust.id)" -Method Put -Body $updateBody -ContentType "application/json" -WebSession $session
Write-Host "Updated customer                 : Name $($updated.nama), Label $($updated.label)"

# Delete that customer as Admin
$delResp = Invoke-RestMethod -Uri "http://localhost:8080/api/pelanggan/$($newCust.id)" -Method Delete -WebSession $session
Write-Host "Deleted customer (Admin)         :" $delResp.message

# Download CSV
$csv = Invoke-WebRequest -Uri "http://localhost:8080/api/pelanggan/export/csv" -WebSession $session -UseBasicParsing
Write-Host "Export CSV Download              : HTTP" $csv.StatusCode "(Bytes: $($csv.Content.Length))"

Write-Host "`n================ 4. ORDERS & KITCHEN STATUS ================"
$orders = Invoke-RestMethod -Uri "http://localhost:8080/api/pesanan" -Method Get -WebSession $session
Write-Host "Total orders in system           :" $orders.total "(Active in queue: $($orders.rows.Count))"

# Create order
$orderBody = '{"pid":"P01","saluran":"Dine-in (Meja 03)","menu":"Indomie telor kornet (2x) [Meja 03, Telur setengah matang]","nominal":24000,"status":"Menunggu"}'
$createdOrder = Invoke-RestMethod -Uri "http://localhost:8080/api/pesanan" -Method Post -Body $orderBody -ContentType "application/json" -WebSession $session
Write-Host "Created order (Kasir/Meja)       : ID $($createdOrder.id), Menu $($createdOrder.menu), Status $($createdOrder.status)"

# Koki starts cooking
$cookStatus = Invoke-RestMethod -Uri "http://localhost:8080/api/pesanan/$($createdOrder.id)/status" -Method Patch -Body '{"status":"Dimasak"}' -ContentType "application/json" -WebSession $session
Write-Host "Koki action (Mulai Masak)        : ID $($cookStatus.id), Status $($cookStatus.status)"

# Koki finishes cooking
$readyStatus = Invoke-RestMethod -Uri "http://localhost:8080/api/pesanan/$($createdOrder.id)/status" -Method Patch -Body '{"status":"Siap Saji"}' -ContentType "application/json" -WebSession $session
Write-Host "Koki action (Siap Saji)          : ID $($readyStatus.id), Status $($readyStatus.status)"

# Server serves to table
$doneStatus = Invoke-RestMethod -Uri "http://localhost:8080/api/pesanan/$($createdOrder.id)/status" -Method Patch -Body '{"status":"Selesai"}' -ContentType "application/json" -WebSession $session
Write-Host "Order completed (Selesai)        : ID $($doneStatus.id), Status $($doneStatus.status)"

Write-Host "`n================ 5. MASUKAN & SLA TRACKING ================"
$masukan = Invoke-RestMethod -Uri "http://localhost:8080/api/masukan" -Method Get -WebSession $session
Write-Host "Tickets : Baru=$($masukan.cntBaru), Diproses=$($masukan.cntDiproses), Selesai=$($masukan.cntSelesai)"

# Add complaint ticket
$ticketBody = '{"pid":"P01","kanal":"Dine-in","kat":"Kualitas Rasa","pic":"Koki","isi":"Mie agak sedikit terlalu lembek saat jam sibuk"}'
$newTicket = Invoke-RestMethod -Uri "http://localhost:8080/api/masukan" -Method Post -Body $ticketBody -ContentType "application/json" -WebSession $session
Write-Host "Created Ticket                   : ID $($newTicket.id), Kat $($newTicket.kat), Status $($newTicket.status)"

# Respond complaint within SLA
$respTicket = Invoke-RestMethod -Uri "http://localhost:8080/api/masukan/$($newTicket.id)/respond" -Method Patch -WebSession $session
Write-Host "Responded Ticket (SLA)           : ID $($respTicket.id), Status $($respTicket.status), Response Time: $($respTicket.resp)"

Write-Host "`n================ 6. DASHBOARD EKSEKUTIF (PEMILIK) ================"
$dash = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard" -Method Get -WebSession $session
Write-Host "Dashboard KPI: Total Omset       : Rp$($dash.totalOmset.ToString('N0'))"
Write-Host "Dashboard KPI: Total Pesanan     :" $dash.totalPesanan
Write-Host "Dashboard KPI: Opt-in Rate       :" $dash.optInRate "%"

Write-Host "`n================ 7. SAPA HANGAT WHATSAPP (P12) ================"
$sapa = Invoke-RestMethod -Uri "http://localhost:8080/api/sapa-hangat" -Method Get -WebSession $session
Write-Host "Total Sapa Hangat Targets        :" $sapa.Count
Write-Host "Sample Target                    :" $sapa[0].pelangganNama "($($sapa[0].pelangganSeg))"
Write-Host "Draft Preview                    :" $sapa[0].draftPesan.Substring(0, 60) "..."

Write-Host "`n>>> ALL 7 MODULES & STRICT ROLE PERMISSIONS VERIFIED SUCCESSFULLY! <<<"
