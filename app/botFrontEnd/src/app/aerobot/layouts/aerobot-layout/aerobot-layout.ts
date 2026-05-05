import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-aerobot-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './aerobot-layout.html',
  styles: ``,
})
export default class AerobotLayout {

  list_items = [
    { path: '/aerobot/new-chat', label: 'New Chat', icon: 'fa-solid fa-plus' },
    { path: '/aerobot/chat', label: 'Chat', icon: 'fa-regular fa-comment' },
    { path: '/aerobot/projects', label: 'Projects', icon: 'fa-solid fa-briefcase' },
    { path: '/aerobot/skills', label: 'Skills', icon: 'fa-regular fa-star' }
  ]

  logoUrl = 'assets/images/logo.png';

}
