import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sb-modal-wrapper',
  templateUrl: './sb-modal-wrapper.component.html',
  styleUrls: ['./sb-modal-wrapper.component.css']
})
export class SbModalWrapperComponent implements OnInit {

  private _resolveObject: Object;
  private _title: string;
  private _titleBackgroundColor: string;

  @Input() public set resolveObject(value: Object) {
    this._resolveObject = value;
  }

  @Input() public set title(value: string) {
    this._title = value;
  }

  @Input() public set titleBackgroundColor(value: string) {
    this._titleBackgroundColor = value;
  }

  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onSave: EventEmitter<any> = new EventEmitter();


  constructor(
    private ngbActiveModal: NgbActiveModal
  ) { }


  ngOnInit() {

  }

  close() {
    let activeModal: any;
    activeModal = this.ngbActiveModal;
    const data = {
      activeModal
    };

    this.onClose.emit(data);
  }

  save() {
    let activeModal: any;
    activeModal = this.ngbActiveModal;
    const data = {
      activeModal
    };
    this.onSave.emit(data);
  }

}
