import { newSpecPage } from '@stencil/core/testing';
import { PagePartners } from '../page-partners';

describe('page-partners', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PagePartners],
      html: `<page-partners></page-partners>`,
    });
    expect(page.root).toEqualHtml(`
      <page-partners>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-partners>
    `);
  });
});
