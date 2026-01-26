import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBookmarkListComponent } from './admin-bookmark-list.component';

describe('AdminBookmarkListComponent', () => {
  let component: AdminBookmarkListComponent;
  let fixture: ComponentFixture<AdminBookmarkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBookmarkListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBookmarkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
