import { isPlatformBrowser } from '@angular/common';
import { inject, Inject, PLATFORM_ID, Service } from '@angular/core';

@Service()
export class FlowbiteService {
private platformId:any=inject(PLATFORM_ID)
  loadFlowbite(callback: (flowbite: any) => void) {
    if (isPlatformBrowser(this.platformId)) {
      import('flowbite').then(flowbite => {
        callback(flowbite);
      });
    }
  }
}
