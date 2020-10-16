import {
  AfterContentChecked,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output, Renderer2
} from '@angular/core';

export interface IIntersectionOptions {
  root: Element | null;
  rootMargin: string;
  thresholds: number[];
}

export const INFINITE_SCROLL_CLASS = 'infinite-scroll-class';

@Directive({
  selector: '[myInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnDestroy, AfterContentChecked {
  @Input() public set options(value: Partial<IIntersectionOptions>) {
    this._options = {
      root: this._rootOption,
      ...value,
    }
  };
  public get options(): Partial<IIntersectionOptions> {
    return this._options || { root: this._rootOption };
  }
  @Output() public scrolled: EventEmitter<void> = new EventEmitter<void>();

  private _observer: IntersectionObserver;
  private _options: Partial<IIntersectionOptions>;
  private _anchor: Element;

  private get _isScrollable(): boolean {
    const componentStyles = this._el.nativeElement.style;
    const overflowValues = ['scroll', 'auto'];

    return componentStyles?.overflow === 'auto' || overflowValues.includes(componentStyles?.overflowY);
  }

  private get _rootOption(): Element | null {
    return this._isScrollable ? this._el.nativeElement as Element : null;
  }

  constructor(private _el: ElementRef, private _renderer: Renderer2) {}

  public ngAfterContentChecked(): void {
    this._removeAnchor();

    if (this._observer) {
      this._observer.disconnect();
    }

    this._addAnchor();
    this._addListener();
  }

  public ngOnDestroy(): void {
    this._observer.disconnect();
  }

  private _removeAnchor(): void {
    const anchorEl: Element = this._el.nativeElement.querySelector(INFINITE_SCROLL_CLASS);

    if (anchorEl) {
      this._renderer.removeChild(this._el.nativeElement, anchorEl);
    }
  }

  private _addAnchor(): void {
    const anchorEl: Element = this._renderer.createElement('div');
    this._renderer.addClass(anchorEl, INFINITE_SCROLL_CLASS);
    this._renderer.appendChild(this._el.nativeElement, anchorEl);

    this._anchor = anchorEl;
  }

  private _addListener(): void {
    this._observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.scrolled.emit();
      }
    }, this.options);

    this._observer.observe(this._anchor);
  }
}
