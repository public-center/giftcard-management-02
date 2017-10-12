/**
 * Trigger download
 */
export class TriggerDownloadService {
  /**
   * Trigger download dialog
   * @param url Full url of download
   */
  triggerDownload(url) {
    const form = angular.element('<form method="get" action="' + url + '"></form>');
    angular.element('html').append(form);
    form.trigger('submit');
    angular.element(form).remove();
  }
}
