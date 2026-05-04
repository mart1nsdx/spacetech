import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-chat-page',
  imports: [ CommonModule],
  templateUrl: './new-chat-page.html',
})
export default class NewChatPage {
  logoUrl = 'assets/images/logo.png';

  user = "usuario"
  agente = "deepSeek v4.0"

}
