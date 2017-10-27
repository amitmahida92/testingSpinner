import { Injectable } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class SbModalPopupService {

    private modalOptions: NgbModalOptions = {
        backdrop: false,
        keyboard: false,
        windowClass: 'modal_backdrop',
        // container: '.modal_backdrop'
    };

    constructor(
        private modalService: NgbModal,
    ) { }

    open(component, resolveObject) {
        const modalRef: any = this.modalService.open(component, this.modalOptions);
        modalRef.componentInstance.resolveObject = resolveObject;
        return modalRef;
    }
}
