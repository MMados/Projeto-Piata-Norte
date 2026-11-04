import { Component, DestroyRef, inject } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MenuLateralComponent } from "./component/menu-lateral/menu-lateral";

/** Shell da aplicação: apresenta as rotas e controla o menu lateral. */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, MenuLateralComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  exibirMenu = false;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Inicia a observação de navegação após a criação do shell. */
  ngOnInit(): void {
    this.monitorarNavegacao();
  }

  /** Atualiza a visibilidade do menu quando uma navegação termina. */
  monitorarNavegacao(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const urlAtual = event.urlAfterRedirects || event.url;
        this.exibirMenu = this.verificarSeExibeMenu(urlAtual);
      });
  }

  private verificarSeExibeMenu(url: string): boolean {
    const paginasComMenu = [
      "/dashboard",
      "/orcamento",
      "/preview",
      "/cadastro",
    ];
    return paginasComMenu.some((pagina) => url.startsWith(pagina));
  }
}
