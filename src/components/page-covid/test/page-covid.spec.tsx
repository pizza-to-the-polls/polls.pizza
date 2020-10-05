import { newSpecPage } from '@stencil/core/testing';
import { PageCovid } from '../page-covid';

describe('page-covid', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PageCovid],
      html: `<page-covid></page-covid>`,
    });
    expect(page.root).toEqualHtml(`
      <page-covid>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-covid>
    `);
  });
});
