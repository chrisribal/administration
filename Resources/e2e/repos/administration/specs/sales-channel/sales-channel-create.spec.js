const salesChannelPage = require('administration/page-objects/module/sw-sales-channel.page-object.js');
const customerPage = require('administration/page-objects/module/sw-customer.page-object.js');

module.exports = {
    '@tags': ['sales-channel-create', 'sales-channel', 'create'],
    'open sales channel creation': (browser) => {
        browser.expect.element('.sw-admin-menu__headline').to.have.text.that.contains('Sales channel').before(browser.globals.waitForConditionTimeout);

        browser
            .click('.sw-admin-menu__headline-action')
            .expect.element('.sw-sales-channel-modal__title').to.have.text.that.contains('Add sales channel').before(browser.globals.waitForConditionTimeout);
    },
    'show details of a storefront sales channel': (browser) => {
        const page = salesChannelPage(browser);

        browser
            .expect.element(`${page.elements.gridRow}--0 .sw-sales-channel-modal__grid-item-name`).to.have.text.that.contains('Storefront').before(browser.globals.waitForConditionTimeout);

        browser
            .waitForElementVisible(`${page.elements.gridRow}--0 .sw-sales-channel-modal__show-detail-action`)
            .click(`${page.elements.gridRow}--0 .sw-sales-channel-modal__show-detail-action`)
            .expect.element('.sw-sales-channel-modal__title').to.have.text.that.contains('Details of Storefront').before(browser.globals.waitForConditionTimeout);
    },
    'open module to add new storefront sales channel': (browser) => {
        const page = salesChannelPage(browser);

        browser
            .waitForElementVisible('.sw-sales-channel-modal__add-sales-channel-action')
            .click('.sw-sales-channel-modal__add-sales-channel-action')
            .expect.element(`.sw-card:nth-of-type(1) ${page.elements.cardTitle}`).to.have.text.that.contains('General Settings').before(browser.globals.waitForConditionTimeout);
        browser.assert.urlContains('#/sw/sales/channel/create');
    },
    'fill in form and save new sales channel': (browser) => {
        const page = salesChannelPage(browser);
        page.createBasicSalesChannel('1st Epic Sales Channel');
    },
    'verify creation and check if the data of the sales channel is assigned correctly': (browser) => {
        const page = salesChannelPage(browser);

        browser
            .refresh();

        page.openSalesChannel('1st Epic Sales Channel');
        browser
            .waitForElementNotPresent(page.elements.loader)
            .expect.element(page.elements.salesChannelNameInput).to.have.value.that.equals('1st Epic Sales Channel').before(browser.globals.waitForConditionTimeout);
    },
    'check if the sales channel can be used in other modules': (browser) => {
        const customerPageObject = customerPage(browser);

        browser
            .openMainMenuEntry({
                mainMenuPath: '#/sw/customer/index',
                menuTitle: 'Customers',
                index: 3
            })
            .waitForElementPresent('.smart-bar__actions a[href="#/sw/customer/create"]')
            .click('.smart-bar__actions a[href="#/sw/customer/create"]')
            .waitForElementVisible(customerPageObject.elements.customerForm)
            .fillSelectField('select[name=sw-field--customer-salesChannelId]', '1st Epic Sales Channel');
    },
    after: (browser) => {
        browser.end();
    }
};
