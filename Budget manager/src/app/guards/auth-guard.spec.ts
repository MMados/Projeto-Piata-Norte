import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from "@angular/router";
import { Observable, firstValueFrom } from "rxjs";
import { firebaseTestProviders } from '../testing/firebase-test-providers';
import { authGuard } from "./auth-guard";

describe("authGuard", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...firebaseTestProviders],
    });
  });

  it("redirects users without a session to the login page", async () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    const guardResult = await firstValueFrom(result as Observable<boolean | UrlTree>);
    const router = TestBed.inject(Router);

    expect(guardResult instanceof UrlTree).toBe(true);
    if (guardResult instanceof UrlTree) {
      expect(router.serializeUrl(guardResult)).toBe("/login");
    }
  });
});
