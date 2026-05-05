import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChatPage } from './new-chat-page';

describe('NewChatPage', () => {
  let component: NewChatPage;
  let fixture: ComponentFixture<NewChatPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChatPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NewChatPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
