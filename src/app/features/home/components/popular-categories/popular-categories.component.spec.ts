import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopularCategoriesComponent } from './popular-categories.component';

describe('PopularCategoriesComponent', () => {
  let component: PopularCategoriesComponent;
  let fixture: ComponentFixture<PopularCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularCategoriesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopularCategoriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
