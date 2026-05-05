import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatByIdPage } from './chat-by-id-page';

describe('ChatByIdPage', () => {
  let component: ChatByIdPage;
  let fixture: ComponentFixture<ChatByIdPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatByIdPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatByIdPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
