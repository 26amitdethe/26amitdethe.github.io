import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  signal,
  effect,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  portfolioData = signal<any>(null);
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient) {
    // Re-run scroll reveal whenever data loads
    effect(() => {
      if (this.portfolioData()) {
        setTimeout(() => this.initScrollReveal(), 150);
      }
    });
  }

  ngOnInit() {
    this.http.get('/assets/master.json').subscribe((data) => {
      this.portfolioData.set(data);
      // console.log('Portfolio data loaded:', data != null);
    });
    this.trackVisit();
  }

  async trackVisit() {
    const urlParams = new URLSearchParams(window.location.search);
    const customRef = urlParams.get('ref');
    
    // If the URL has ?ref=resume, it will use that. Otherwise, it checks the normal referrer.
    const referrer = customRef ? `Resume Link (${customRef})` : (document.referrer || 'Direct Visit');

    const userAgent = navigator.userAgent;
    const resolution = `${window.innerWidth}x${window.innerHeight}`;
    let location = 'Location Unknown';

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
    const path = window.location.pathname;

    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const geoData = await response.json();
        location = `${geoData.city}, ${geoData.region}`;
      }
    } catch (error) {
      console.error('Location blocked');
    }

    const messagePayload = `
📍 ${location} (${timeZone})
🔗 Path: ${path}
🔙 Ref: ${referrer}
💻 ${resolution} | ${isDarkMode} Mode
🗣️ Lang: ${language}
    `.trim();

    fetch('https://ntfy.sh/adawg_portfolio_alert_uwm', {
        method: 'POST',
        body: messagePayload,
        headers: {
            'Title': 'New Visitor',
            'Priority': 'default',
            'Tags': '' 
        }
    }).then(() => console.log('Ping sent'))
      .catch(err => console.error('Ping failed', err));
  }

  private initScrollReveal(): void {
    // Disconnect any previous observer before creating a new one
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll(
      '.job-item, .project-item-card, .skill-category-card, .edu-item, .contact-section-container'
    );
    targets.forEach((el) => this.observer.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}