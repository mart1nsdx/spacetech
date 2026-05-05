import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found-page.html',
})
export default class NotFoundPage {}