import template from './sw-sales-channel-detail-product-comparison.html.twig';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;
const { warn } = Shopware.Utils.debug;

Component.register('sw-sales-channel-detail-product-comparison', {
    template,

    mixins: [
        Mixin.getByName('notification'),
        Mixin.getByName('placeholder')
    ],

    inject: [
        'salesChannelService',
        'repositoryFactory',
        'context',
        'productExportService',
        'entityMappingService'
    ],

    props: {
        salesChannel: {
            required: true
        },

        productExport: {
            required: true
        },

        isLoading: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            showDeleteModal: false,
            defaultSnippetSetId: '71a916e745114d72abafbfdc51cbd9d0',
            isLoadingDomains: false,
            deleteDomain: null,
            previewContent: null,
            previewErrors: null,
            isLoadingPreview: false,
            isPreviewSuccessful: false,
            isLoadingValidate: false,
            isValidateSuccessful: false
        };
    },

    computed: {
        editorConfig() {
            return {
                enableBasicAutocompletion: true
            };
        },

        productExportRepository() {
            return this.repositoryFactory.create('product_export');
        },

        domainRepository() {
            return this.repositoryFactory.create(
                this.salesChannel.domains.entity,
                this.salesChannel.domains.source
            );
        },

        salesChannelRepository() {
            return this.repositoryFactory.create('sales_channel');
        },

        mainNavigationCriteria() {
            const criteria = new Criteria(1, 10);

            return criteria.addFilter(Criteria.equals('type', 'page'));
        },

        outerCompleterFunctionHeader() {
            return this.completerFunction({
                productExport: 'product_export'
            });
        },

        outerCompleterFunctionBody() {
            return this.completerFunction({
                productExport: 'product_export',
                product: 'product'
            });
        },

        outerCompleterFunctionFooter() {
            return this.completerFunction({
                productExport: 'product_export'
            });
        }
    },

    methods: {
        validateTemplate() {
            const notificationValidateSuccess = {
                title: this.$tc('sw-sales-channel.detail.productComparison.notificationTitleValidateSuccessful'),
                message: this.$tc('sw-sales-channel.detail.productComparison.notificationMessageValidateSuccessful')
            };

            this.isLoadingValidate = true;

            this.productExportService
                .validateProductExportTemplate(this.productExport)
                .then((data) => {
                    this.isLoadingValidate = false;

                    if (data.errors) {
                        this.previewContent = data.content;
                        this.previewErrors = data.errors;
                        return;
                    }

                    this.createNotificationSuccess(notificationValidateSuccess);
                    this.isValidateSuccessful = true;
                }).catch((exception) => {
                    this.createNotificationError({
                        title: this.$tc('sw-sales-channel.detail.productComparison.notificationTitleValidateError'),
                        message: exception.response.data.errors[0].detail
                    });
                    warn(this._name, exception.message, exception.response);

                    this.isLoadingValidate = false;
                    this.isValidateSuccessful = false;
                });
        },

        preview() {
            this.isLoadingPreview = true;

            this.productExportService
                .previewProductExport(this.productExport)
                .then((data) => {
                    this.isLoadingPreview = false;
                    this.previewContent = data.content;

                    if (data.errors) {
                        this.previewErrors = data.errors;
                        return;
                    }

                    this.isPreviewSuccessful = true;
                }).catch((exception) => {
                    this.createNotificationError({
                        title: this.$tc('sw-sales-channel.detail.productComparison.notificationTitlePreviewError'),
                        message: exception.response.data.errors[0].detail
                    });
                    warn(this._name, exception.message, exception.response);

                    this.isLoadingPreview = false;
                });
        },


        completerFunction(mapping) {
            return (function completerWrapper(entityMappingService) {
                function completerFunction(prefix) {
                    const entityMapping = entityMappingService.getEntityMapping(prefix, mapping);
                    return Object.keys(entityMapping).map(val => {
                        return { value: val };
                    });
                }

                return completerFunction;
            }(this.entityMappingService));
        },

        onPreviewClose() {
            this.previewContent = null;
            this.previewErrors = null;
            this.isPreviewSuccessful = false;
        },

        resetValid() {
            this.isValidateSuccessful = false;
        }
    }
});
