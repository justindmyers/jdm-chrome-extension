import { Color, RGB, HSL } from './color';
import Rainbow from './rainbow';
import stackBlurCanvasRGB from './StackBlur';

/**
 * Customizable background generator. 
 * Can pass in various options to control the size, shape, and timing of the background.
 */
export class BackgroundGenerator {
    constructor(options) {
        this.options = Object.assign({
            shapeWidth: 30,
            shapeHeight: 30,
            gradients: [],
            animationTiming: 2000,
            colorAnimationTiming: 5000,
            maxLightnessChange: 35,
            blurRadius: 0,
            shapeType: this.SHAPE_TRIANGLE,
            lightnessEasing: t => {
                return t * t * t;
            },
            gradientTransitionEasing: t => {
                return t * t * t;
            },
            drawingRoutines: {
                'triangle': this._drawTriangle,
                'square': this._drawSquare
            }
        }, options);

        // Internal Properties
        this._animationFrameRequest;
        this._animationProgress;
        this._canvas;
        this._context;
        this._currentGradientIndex = this.randomBetween(0, this.options.gradients.length - 1);
        this._gradientAnimationProgress = 0;
        this._shapesArray = [];
        this._yCalculation = Math.ceil(window.innerHeight / this.options.shapeHeight);
        this._xCalculation = Math.ceil(window.innerWidth / this.options.shapeWidth);
        this._rainbow = new Rainbow();

        this._rainbow.setSpectrumByArray(this.options.gradients[this._currentGradientIndex].gradient);
        this._rainbow.setNumberRange(0, this._yCalculation);

        this._shapesArray = this.setupShapes(this._xCalculation, this._yCalculation);

        window.addEventListener('resize', () => this.resizeCanvas(), false);

        this.addCanvas();
        this.resizeCanvas();
    }

    // Static Properties
    static get SHAPE_TRIANGLE() {
        return 'triangle';
    }

    static get SHAPE_SQUARE() {
        return 'square';
    }

    /**
     * Draws a triangle shaped background. Can be overriden using the option 'drawingRoutines'
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} shapeWidth 
     * @param {*} shapeHeight 
     * @param {*} currentShape 
     * @param {*} drawShapeCallback 
     */
    _drawTriangle = (x, y, shapeWidth, shapeHeight, currentShape, context, drawShapeCallback) => {
        let alternateX = (y % 2) ? 0 : -(shapeWidth / 2);
        context.translate(alternateX, 0);

        drawShapeCallback(currentShape, [{
                x: (shapeWidth / 2) + (shapeWidth * x),
                y: y * shapeHeight
            },
            {
                x: shapeWidth + (shapeWidth * x),
                y: shapeHeight * (y + 1)
            },
            {
                x: shapeWidth * x,
                y: shapeHeight * (y + 1)
            }
        ]);

        // We're doing some fuckery here to draw the second triangle
        if (typeof currentShape.randomX == 'undefined') {
            currentShape.randomX = this.randomBetween(0, this._xCalculation);
        }

        drawShapeCallback(this._shapesArray[y][this._shapesArray[y][x + 1].randomX], [{
                x: (shapeWidth / 2) + (shapeWidth * x),
                y: shapeHeight * y
            },
            {
                x: shapeWidth + (shapeWidth * x),
                y: shapeHeight * (y + 1)
            },
            {
                x: (shapeWidth / 2) + (shapeWidth * (x + 1)),
                y: shapeHeight * y
            }
        ]);

        context.translate(-alternateX, 0);
    }

    /**
     * Draws a square shaped background. Can be overriden using the option 'drawingRoutines'
     * @param {*} x 
     * @param {*} y 
     * @param {*} shapeWidth 
     * @param {*} shapeHeight 
     * @param {*} currentShape 
     * @param {*} drawShapeCallback 
     */
    _drawSquare = (x, y, shapeWidth, shapeHeight, currentShape, context, drawShapeCallback) => {
        drawShapeCallback(currentShape, [{
                x: shapeWidth * x,
                y: shapeHeight * y
            },
            {
                x: shapeWidth + (shapeWidth * x),
                y: shapeHeight * y
            },
            {
                x: shapeWidth + (shapeWidth * x),
                y: shapeHeight * (y + 1)
            },
            {
                x: shapeWidth * x,
                y: shapeHeight * (y + 1)
            }
        ]);
    }

    /**
     * 
     */
    render() {
        this.drawBackground();
        this.animateColors();
    }

    /**
     * Add the initial canvas to the document and save the canvas/context properties
     */
    addCanvas() {
        let canvasElement = document.createElement('canvas');
        canvasElement.id = 'triangle';
        document.body.appendChild(canvasElement);

        this._canvas = canvasElement;
        this._context = this._canvas.getContext('2d');
    }

    /**
     * Draw the solid gradient background
     */
    drawBackground() {
        const canvasGradient = this._context.createLinearGradient(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);

        this.options.gradients[this._currentGradientIndex].gradient.forEach((color, index) => {
            canvasGradient.addColorStop(index == 0 ? 0 : (index + 1) / this.options.gradients[this._currentGradientIndex].gradient.length, color);
        })

        this._context.fillStyle = canvasGradient;
        this._context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    /**
     * Individual shape drawing routine.
     * 
     * @param {*} currentShape - Current shape object
     * @param {*} points - Array of points to draw for the current shape
     */
    drawShape(currentShape, points) {
        let maxValueIncrease;
        let valueIncrease;

        this._context.beginPath();

        this._context.moveTo(points[0].x, points[0].y);

        points.forEach((point, index) => {
            if (index > 0) {
                this._context.lineTo(point.x, point.y);
            }
        })

        this._context.closePath();

        // Animate the lightness levels
        maxValueIncrease = (currentShape.color.l * currentShape.maxLightnessChange) - currentShape.color.l;

        if (currentShape.animationDirection) {
            valueIncrease = this.options.lightnessEasing(currentShape.progress / currentShape.animationOffset) * maxValueIncrease;
        } else {
            valueIncrease = (1 - this.options.lightnessEasing(currentShape.progress / currentShape.animationOffset)) * maxValueIncrease;
        }

        valueIncrease = valueIncrease - (maxValueIncrease / 2);

        this._context.fillStyle = new HSL(currentShape.color.h, currentShape.color.s, currentShape.color.l + valueIncrease).formatted();
        this._context.fill();
    }

    /**
     * 
     * @param {*} xWidth 
     * @param {*} yWidth 
     */
    setupShapes(xWidth, yWidth) {
        let shapes = [
            []
        ];
        let currentGradientColor;

        for (let y = 0; y < yWidth; y++) {
            currentGradientColor = Color.hexToHsl('#' + this._rainbow.colourAt(y));

            for (let x = -1; x <= xWidth; x++) {
                if (typeof shapes[y] === 'undefined') {
                    shapes[y] = [];
                }

                // Cache the color so we don't have to recalculate when resizing the screen
                shapes[y][x + 1] = this.createInitialShapeObject(currentGradientColor);
            }
        }

        return shapes;
    }

    /**
     * 
     * @param {*} currentGradientColor 
     */
    createInitialShapeObject(currentGradientColor) {
        return {
            color: Object.assign({}, currentGradientColor),
            originalColor: Object.assign({}, currentGradientColor),
            animationDirection: !!this.randomBetween(0, 2),
            maxLightnessChange: (this.randomBetween(0, this.options.maxLightnessChange) / 100) + 1,
            animationOffset: this.randomBetween(this.options.animationTiming / 2, this.options.animationTiming * 2)
        };
    }

    /**
     * 
     */
    updateShapeColors() {
        let gradientColorRGB;
        let gradientColorHSL;

        for (let y = 0; y < this._yCalculation; y++) {
            gradientColorRGB = Color.hexToHsl('#' + this._rainbow.colourAt(y));
            gradientColorHSL = Color.hexToRgb('#' + this._rainbow.colourAt(y));

            for (let x = -1; x <= this._xCalculation; x++) {
                this._shapesArray[y][x + 1].originalColor = gradientColorRGB;
            }
        }
    }

    /**
     * 
     * @param {*} gradientColor 
     * @param {*} shape 
     */
    gradientTransition(gradientColor, shape) {
        let lightnessOffset;
        let transparencyValue;
        let gradientEasingProgress = this.options.gradientTransitionEasing(this._gradientAnimationProgress / this.options.colorAnimationTiming);

        // Transition the colors
        if (this.startGradientTransition) {
            lightnessOffset = shape.originalColor.l - gradientColor.l;
            transparencyValue = Color.calculateTransparency(Color.hslToRgb(shape.originalColor), Color.hslToRgb(gradientColor), 1 - gradientEasingProgress);

            shape.color.h = transparencyValue.h;
            shape.color.s = transparencyValue.s;

            if (lightnessOffset > 0) {
                shape.color.l = shape.originalColor.l - (gradientEasingProgress * Math.abs(lightnessOffset));
            } else {
                shape.color.l = shape.originalColor.l + (gradientEasingProgress * Math.abs(lightnessOffset));
            }
        }
    }

    /**
     * 
     */
    drawRow() {
        let gradientColor;

        for (let y = 0; y < this._yCalculation; y++) {
            gradientColor = Color.hexToHsl('#' + this._rainbow.colourAt(y));

            for (let x = -1; x <= this._xCalculation; x++) {
                this.gradientTransition(gradientColor, this._shapesArray[y][x + 1]);

                this.options.drawingRoutines[this.options.shapeType](x, y, this.options.shapeWidth, this.options.shapeHeight, this._shapesArray[y][x + 1], this._context, this.drawShape.bind(this));

                this.renderLoopEndUpdate(this._shapesArray[y][x + 1]);
            }
        }
    }

    /**
     * 
     * @param {*} shape 
     */
    renderLoopEndUpdate(shape) {
        // Time each shape individually
        if (!shape.start) {
            shape.start = performance.now();
        }

        // Get the current progress
        shape.progress = performance.now() - shape.start;

        if (shape.progress > shape.animationOffset) {
            shape.animationDirection = !shape.animationDirection;
            shape.progress = 0;
            shape.start = null;
        }
    }

    /**
     * 
     */
    animateColors() {
        let animationStart;
        let gradientAnimationStart;

        window.cancelAnimationFrame(this._animationFrameRequest);

        function step(timestamp) {
            if (!animationStart) animationStart = timestamp;

            this._animationProgress = timestamp - animationStart;

            if (this._animationProgress > this.options.colorAnimationTiming) {
                this._animationProgress = 0;
                animationStart = null;

                if (this._gradientAnimationProgress === 0) {
                    this.startGradientTransition = true;
                    gradientAnimationStart = timestamp;

                    this._currentGradientIndex = this.randomBetween(0, this.options.gradients.length - 1);
                    this._rainbow.setSpectrumByArray(this.options.gradients[this._currentGradientIndex].gradient);
                    this._rainbow.setNumberRange(0, this._yCalculation);
                }
            }

            if (this.startGradientTransition) {
                this._gradientAnimationProgress = timestamp - gradientAnimationStart;
            }

            if (this._gradientAnimationProgress > this.options.colorAnimationTiming) {
                this.startGradientTransition = false;
                this._gradientAnimationProgress = 0;
                this._animationProgress = 0;
                animationStart = null;

                this.updateShapeColors();
            }

            this.drawRow();

            // Disabling because it causes performance problems when looped
            if (this.options.blurRadius) {
                stackBlurCanvasRGB(this._canvas, this._context, 'triangle', 0, 0, window.innerWidth, window.innerHeight, this.options.blurRadius);
            }

            window.requestAnimationFrame(step.bind(this));
        }

        this._animationFrameRequest = window.requestAnimationFrame(step.bind(this));
    }

    /**
     * 
     */
    resizeCanvas() {
        this._yCalculation = Math.ceil(window.innerHeight / this.options.shapeHeight);
        this._xCalculation = Math.ceil(window.innerWidth / this.options.shapeWidth);

        //Reset the gradient cache if the window height changes
        if (this._canvas.height !== window.innerHeight) {
            this._rainbow.setNumberRange(0, this._yCalculation);
        }

        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;

        this.render(true);
    }

    /** 
     * Utility function to generate a random number with a lower and upper limit
     * @param {*} min - Lower limit
     * @param {*} max - Upper limit
     */
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

if (typeof module !== 'undefined') {
    module.exports = BackgroundGenerator;
}