<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin') · Talora Apply</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root{--talora:#246BFD;--nav:#0B1220;--bg:#F5F7FB;--muted:#657189}
        body{background:var(--bg);color:#172033}.admin-sidebar{width:280px;background:var(--nav);min-height:100vh;position:fixed;inset:0 auto 0 0;overflow-y:auto}.admin-main{margin-left:280px;min-height:100vh}.brand{font-weight:800;letter-spacing:-.04em}.nav-section{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:#69758d;margin:1.5rem 1rem .5rem}.sidebar-link{display:flex;gap:.75rem;align-items:center;color:#aab4c8;text-decoration:none;padding:.65rem .9rem;border-radius:.75rem;margin:.15rem .7rem}.sidebar-link:hover,.sidebar-link.active{background:#17233a;color:#fff}.metric-card{border:0;border-radius:1rem;box-shadow:0 8px 30px rgba(17,24,39,.05)}.metric-icon{width:46px;height:46px;border-radius:.85rem;background:#eaf1ff;color:var(--talora);display:grid;place-items:center;font-size:1.25rem}.table-card{border:0;border-radius:1rem;overflow:hidden}.badge-soft{background:#eef3ff;color:#285fd1}.form-card{border:0;border-radius:1rem;box-shadow:0 8px 30px rgba(17,24,39,.05)}pre.json{white-space:pre-wrap;max-height:280px;overflow:auto;background:#101827;color:#d9e2f1;padding:1rem;border-radius:.75rem}@media(max-width:991px){.admin-sidebar{position:static;width:100%;min-height:auto}.admin-main{margin-left:0}}
    </style>
    @stack('styles')
</head>
<body>
<div class="admin-sidebar p-3">
    <a href="{{ route('admin.dashboard') }}" class="text-white text-decoration-none d-flex align-items-center gap-2 px-2 py-3">
        <span class="rounded-3 d-grid place-items-center bg-primary text-white p-2"><i class="bi bi-stars"></i></span>
        <div><div class="brand fs-5">Talora Apply</div><small class="text-secondary">Administration</small></div>
    </a>
    <a class="sidebar-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}"><i class="bi bi-grid"></i>Visão geral</a>
    <a class="sidebar-link {{ request()->routeIs('admin.monitoring.*') ? 'active' : '' }}" href="{{ route('admin.monitoring.index') }}"><i class="bi bi-activity"></i>Monitoramento</a>
    @foreach(config('admin_resources.groups') as $group => $keys)
        <div class="nav-section">{{ $group }}</div>
        @foreach($keys as $key)
            @php($r = config('admin_resources.resources.'.$key))
            <a class="sidebar-link {{ request()->route('resource') === $key ? 'active' : '' }}" href="{{ route('admin.resources.index', $key) }}"><i class="bi bi-chevron-right small"></i>{{ $r['label'] }}</a>
        @endforeach
    @endforeach
    <div class="nav-section">Observabilidade</div>
    <a class="sidebar-link" href="/pulse" target="_blank"><i class="bi bi-speedometer2"></i>Laravel Pulse <i class="bi bi-box-arrow-up-right ms-auto small"></i></a>
    <a class="sidebar-link" href="/horizon" target="_blank"><i class="bi bi-layers"></i>Laravel Horizon <i class="bi bi-box-arrow-up-right ms-auto small"></i></a>
</div>
<div class="admin-main">
    <nav class="navbar bg-white border-bottom px-4 py-3 sticky-top">
        <div>
            <div class="fw-semibold">@yield('page_title', 'Painel administrativo')</div>
            <small class="text-secondary">Gerência e observabilidade da plataforma</small>
        </div>
        <div class="d-flex align-items-center gap-3">
            <div class="text-end d-none d-md-block"><div class="fw-semibold">{{ auth('admin')->user()->name }}</div><small class="text-secondary">{{ auth('admin')->user()->email }}</small></div>
            <form method="POST" action="{{ route('admin.logout') }}">@csrf<button class="btn btn-outline-secondary btn-sm"><i class="bi bi-box-arrow-right me-1"></i>Sair</button></form>
        </div>
    </nav>
    <main class="p-4 p-lg-5">@yield('content')</main>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
    document.querySelectorAll('[data-confirm-delete]').forEach(form => form.addEventListener('submit', async e => {
        e.preventDefault();
        const result = await Swal.fire({title:'Confirmar exclusão?',text:form.dataset.confirmDelete || 'Esta ação não poderá ser desfeita.',icon:'warning',showCancelButton:true,confirmButtonText:'Excluir',cancelButtonText:'Cancelar',confirmButtonColor:'#dc3545'});
        if(result.isConfirmed) form.submit();
    }));
    @if(session('success')) Swal.fire({toast:true,position:'top-end',icon:'success',title:@json(session('success')),showConfirmButton:false,timer:2800,timerProgressBar:true}); @endif
    @if(session('error')) Swal.fire({toast:true,position:'top-end',icon:'error',title:@json(session('error')),showConfirmButton:false,timer:3500}); @endif
</script>
@stack('scripts')
</body>
</html>
