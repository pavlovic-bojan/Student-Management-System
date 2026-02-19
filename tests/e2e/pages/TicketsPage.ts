import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TicketsPage extends BasePage {
  readonly sidebar = '[data-test="sidebar"]';
  readonly ticketsTable = '[data-test="table-tickets"]';
  readonly cardTickets = '[data-test="card-tickets-table"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/');
    await this.verifyPageLoaded();
  }

  async verifyPageLoaded(): Promise<void> {
    await this.waitForVisible(this.sidebar);
  }

  async hasTicketsTable(): Promise<boolean> {
    return this.isVisible(this.ticketsTable);
  }
}
