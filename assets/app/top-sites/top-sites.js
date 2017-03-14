import angular from 'angular';

import controller from './top-sites.controller';
import template from './top-sites.html';

let component = angular.module('components.top-sites', [])

.component('topSites', {
    template,
    controller
})

.name

export default component;