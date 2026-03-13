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
      console.log('Portfolio data loaded:', data != null);
    });
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
      '.job-item, .project-item-card, .skill-category-card, .edu-item'
    );
    targets.forEach((el) => this.observer.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}