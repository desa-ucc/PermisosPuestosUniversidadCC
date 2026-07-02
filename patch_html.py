with open('/app/src/src/app/app.component.html', 'r') as f:
    content = f.read()

import re

search = """    <nav class="flex-1 flex flex-col overflow-y-auto px-2">
      <a [routerLink]="['/dashboard']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg group">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="text-sm font-semibold">Dashboard</span>
      </a>
      <a [routerLink]="['/catalogos']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">folder_shared</span>
        <span class="text-sm font-semibold">Catálogos Base</span>
      </a>
      <a [routerLink]="['/puestos']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">badge</span>
        <span class="text-sm font-semibold">Puestos</span>
      </a>
      <a [routerLink]="['/colaboradores']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">group</span>
        <span class="text-sm font-semibold">Colaboradores</span>
      </a>
      <a [routerLink]="['/hardware-ideal']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">verified_user</span>
        <span class="text-sm font-semibold">Equipo Ideal</span>
      </a>
      <a [routerLink]="['/hardware']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">computer</span>
        <span class="text-sm font-semibold">Hardware Asignado</span>
      </a>
      <a [routerLink]="['/software']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">terminal</span>
        <span class="text-sm font-semibold">Software Local</span>
      </a>
      <a [routerLink]="['/sitios']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">location_on</span>
        <span class="text-sm font-semibold">Permisos Sitios</span>
      </a>
      <a [routerLink]="['/plataformas']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">cloud_done</span>
        <span class="text-sm font-semibold">Plataformas</span>
      </a>
      <a [routerLink]="['/reportes']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">analytics</span>
        <span class="text-sm font-semibold">Reportes</span>
      </a>
    </nav>"""

replace = """    <nav class="flex-1 flex flex-col overflow-y-auto px-2">
      @for(item of menuItems; track item.route) {
        @if(permissionService.tienePermiso(item.pantalla, 'VER') || item.route === '/dashboard') {
          <a [routerLink]="[item.route]" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" [routerLinkActiveOptions]="item.route === '/dashboard' ? {exact: true} : {exact: false}" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg group">
            <span class="material-symbols-outlined">{{item.icon}}</span>
            <span class="text-sm font-semibold">{{item.name}}</span>
          </a>
        }
      }
    </nav>"""

content = content.replace(search, replace)

with open('/app/src/src/app/app.component.html', 'w') as f:
    f.write(content)
