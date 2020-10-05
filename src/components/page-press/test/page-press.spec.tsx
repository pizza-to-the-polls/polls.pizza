import { newSpecPage } from '@stencil/core/testing';
import { PagePress } from '../page-press';

describe('page-press', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PagePress],
      html: `<page-press></page-press>`,
    });
    expect(page.root).toEqualHtml(`
      <page-press>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-press>
    `);
  });
});
