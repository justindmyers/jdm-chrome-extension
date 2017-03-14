// Angular Libraries
import angular from 'angular';
import 'mobx';
import ngAnimate from 'angular-animate';
import 'angular-aria';
import ngMessages from 'angular-messages';
import ngMaterial from 'angular-material';

// App component
import template from './app.html';
import './app.styl';

// Components
import topSites from './top-sites/top-sites';

angular.module('app', [
    ngAnimate,
    ngMessages,
    ngMaterial,
    topSites
])

.config(($mdThemingProvider) => {
    "ngInject";
})

.constant('$MD_THEME_CSS','')

.component('app', {
    template
});