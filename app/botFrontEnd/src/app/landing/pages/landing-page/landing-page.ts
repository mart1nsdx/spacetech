import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.html',
})
export default class LandingPage implements AfterViewInit, OnDestroy {
  @ViewChild('starsContainer') starsContainer!: ElementRef<HTMLDivElement>;

  private scrollObserver!: IntersectionObserver;
  private animationFrameId!: number;

  features = [
    { icon: '🧠', title: 'IA contextual avanzada', description: 'Comprende como interactuar al completo con tu proyecto.' },
    { icon: '⚡', title: 'Respuesta en milisegundos', description: 'Latencia ultra-baja para responder al instante a cualquier consulta.' },
    { icon: '🔗', title: 'integraciones', description: 'Slack, GMAT, Salesforce, Obsidian, VSC.' },
    { icon: '🌍', title: 'Comunidad', description: 'Discord para todo la comunidad' },
    { icon: '📡', title: 'Analytics en tiempo real', description: 'Dashboard con el consumo de tu agente.' },
    { icon: '🔒', title: 'Seguridad de nivel espacial', description: 'Para implementar' },
  ];

  steps = [
    { title: 'Conecta tus fuentes de conocimiento', description: 'Sube documentos, FAQs o conecta tu base de datos. Aerobot entrena el modelo en minutos.' },
    { title: 'Personaliza identidad y tono', description: 'Define el nombre, personalidad y estilo para que el agente represente tu marca.' },
    { title: 'Despliega en tus canales', description: 'Snippet de código o API REST. Compatible con web, apps, WhatsApp y Slack.' },
    { title: 'El modelo mejora solo', description: 'Aprende de cada interacción. Supervisas y corriges desde el panel.' },
  ];

  ngAfterViewInit(): void {
    this.initStars();
    this.initShootingStars();
    this.initScrollReveal();
  }

  ngOnDestroy(): void {
    if (this.scrollObserver) this.scrollObserver.disconnect();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private initStars(): void {
    const container = document.getElementById('stars-container');
    if (!container) return;

    const numStars = 150;
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${Math.random() * 2 + 1}px;
        height: ${Math.random() * 2 + 1}px;
        --delay: ${Math.random() * 4}s;
        --duration: ${Math.random() * 2 + 2}s;
      `;
      container.appendChild(star);
    }
  }

  private initShootingStars(): void {
    const container = document.getElementById('shooting-stars');
    if (!container) return;

    for (let i = 0; i < 3; i++) {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.cssText = `
        top: ${Math.random() * 50}%;
        left: -100px;
        --delay: ${i * 3}s;
        --duration: ${Math.random() * 1.5 + 1.5}s;
      `;
      container.appendChild(star);
    }
  }

  private initScrollReveal(): void {
    this.scrollObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-slide-left, .reveal-slide-right').forEach(el => {
      this.scrollObserver.observe(el);
    });
  }

  private animate(): void {
    const stars = document.querySelectorAll('.star');
    const t = Date.now() * 0.001;

    stars.forEach((star, i) => {
      const el = star as HTMLElement;
      const baseOpacity = 0.3 + (i % 10) * 0.07;
      el.style.opacity = String(baseOpacity + Math.sin(t + i) * 0.3);
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
