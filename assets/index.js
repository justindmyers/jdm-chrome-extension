// TODO: Clamp lightness change the closer it comes to extremes 0 or 100%
// TODO: Debounce resize event
// TODO: Fix resize
// TODO: Highlight shapes in a radius around cursor or click
// TODO: Add option to turn off animation when not active window - save processor usage
// TODO: Allow gradients to specify percentages
// TODO: Create loading screen

// Global Styling
import 'angular-material/angular-material.css';

// Import Vanilla JS libraries
import BackgroundGenerator from './js/background-generator';
import Bezier from './js/easing';

// Import the Angular application
import app from './app/app';

const gradientSwatches = [{
        name: 'Deep Sea Space',
        gradient: ['#4CA1AF', '#2C3E50']
    },
    {
        name: 'Dusk',
        gradient: ['#19547b', '#ffd89b']
    },
    {
        name: 'Starfall',
        gradient: ['#F0C27B', '#4B1248']
    },
    {
        name: 'Horizon',
        gradient: ['#E5E5BE', '#003973']
    },
    {
        name: 'Aqua Marine',
        gradient: ['#26D0CE', '#1A2980']
    }
];

const background = new BackgroundGenerator({
    canvasId: 'triangle',
    shapeWidth: 20,
    shapeHeight: 20 * (Math.sqrt(3) / 2),
    gradients: gradientSwatches,
    animationTiming: 3000,
    colorAnimationTiming: 5000,
    lightnessEasing: Bezier(.54, .0, 1, 1),
    gradientTransitionEasing: Bezier(0.47, 0, 0.745, 0.715),
    maxLightnessChange: 35,
    blurRadius: 0,
    shapeType: BackgroundGenerator.SHAPE_TRIANGLE
});

if (typeof chrome !== 'undefined') {
    function saveTabData(tab, data) {
        if (tab.incognito) {
            chrome.runtime.getBackgroundPage(function (bgPage) {
                bgPage[tab.url] = data; // Persist data ONLY in memory
            });
        } else {
            localStorage[tab.url] = data; // OK to store data
        }
    }

    if (typeof chrome.tabs !== 'undefined') {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            chrome.tabs.query({}, tabs => {
                tabs.forEach(tab => {
                    if (tab.id !== activeInfo.tabId && typeof background !== undefined) {
                        //background.restartTimer();
                    }
                });
            });
        });
    }
}