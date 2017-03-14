import { computed } from 'mobx';

class TopSitesController {
    constructor($scope) {
        'ngInject';

        this.$scope = $scope;
        this.mostVisitedURLs = [];
    }

    $onInit() {
        if (typeof chrome.topSites !== 'undefined') {
            chrome.topSites.get(mostVisitedURLs => this.getTopSites(mostVisitedURLs));
        }
    }

    getTopSites(mostVisitedURLs) {
        this.$scope.$apply(() => {
            this.mostVisitedURLs = mostVisitedURLs;
        });
    }
}

export default TopSitesController;