/* @ngInject */
function sidebarContact(dispatchers, backState, contactCache, contactMerger, gettextCatalog) {
    const SHOW_DELETE_CONTACTS = 'sidebarContact-show-delete-contacts';
    const SHOW_MERGE_BUTTON = 'sidebarContact-show-merge-button';
    const MERGE_TEXT = 'sidebarContact-merge-text';
    const I18N = {
        merge: gettextCatalog.getString('Merge', null, 'Merge contacts')
    };

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        templateUrl: require('../../../templates/sidebar/sidebarContact.tpl.html'),
        link(scope, element) {
            const { on, unsubscribe, dispatcher } = dispatchers(['contacts']);

            const $mergeText = element.find(`.${MERGE_TEXT}`);
            on('contacts', (event, { type = '' }) => {
                type === 'contactsUpdated' && setTimeout(update, 300);
            });

            function update() {
                const contacts = contactCache.get();

                if (!contacts.length) {
                    return element[0].classList.remove(SHOW_DELETE_CONTACTS);
                }

                element[0].classList.add(SHOW_DELETE_CONTACTS);
                const emails = contactMerger.extractDuplicates(contacts);
                const duplicates = Object.keys(emails).reduce((acc, key) => acc + emails[key].length, 0);

                if (duplicates > 0) {
                    element[0].classList.add(SHOW_MERGE_BUTTON);
                    $mergeText.text(`${I18N.merge} (${duplicates})`);
                } else {
                    element[0].classList.remove(SHOW_MERGE_BUTTON);
                }
            }

            function onClick(event) {
                const action = event.target.getAttribute('data-action');

                switch (action) {
                    case 'back':
                        backState.back();
                        break;
                    case 'deleteContacts':
                        dispatcher.contacts(action, { contactIDs: 'all' });
                        break;
                    case 'mergeContacts':
                    case 'exportContacts':
                    case 'importContacts':
                        dispatcher.contacts(action);
                        break;
                    default:
                        break;
                }
            }

            element.on('click', onClick);
            update();

            scope.$on('$destroy', () => {
                unsubscribe();
                element.off('click', onClick);
            });
        }
    };
}
export default sidebarContact;
