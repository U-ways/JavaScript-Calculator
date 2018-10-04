/*jshint esversion: 6*/
/* Initial selector assignments
==============================================================================*/
const display   = document.querySelector('#screen');
const tracker   = document.querySelector('#tracker');
const numbers   = document.querySelectorAll('#numbers .number');
const operators = document.querySelectorAll('#operators li');

const decimalBtn = document.querySelector('#decimal');
const clearBtn   = document.querySelector('#clear');
const equalBtn   = document.querySelector('#equal');

/* Initial variable assignments
==============================================================================*/

/** @var memory
 * memory  will hold @var register & @var operator values when they're pushed.
 *
 * NOTE:
 * The @var register values will always be converted to float [parseFloat()]
 * When pushed to the memory.
 */
let memory = [];

/** @var history
 * history is used to track the user calculations.
 * It stores any valid input and displays them inside @const tracker.
 */
let history = '';

/** @var register
 * register stores number @type string and is pushed when:
 *  1.The user press the equal button =>
 *     (@const equalBtn @event calculate triggered)
 *  2.The user inputs an operator after inputting a number =>
 *     (@const operators @event operatorHandler triggered)
 */
let register = null;

/** @var operatorLocker
 * As the name indicates, operatorLocker locks operational fucntions:
 *  - @function operatorHandler()
 *  - @function calculate()
 *
 * This is done to avoid errors caused from clicking the operators twice.
 * (E.g. @const operators @event operatorHandler triggered twice.)
 *
 * The value will be true whenever the calculator is not expecting an operator.
 */
let operatorLocker  = true;

/** @var resultChanining
 * As I am allowing the chain of mathematical results, I am using the output of each
 * calculation made as a pushed register value. Thus, the calculator is expecting
 * an operator afterwards.
 *
 * However, if the user decided to not continue with the previous calculation, and start
 * over by pressing a key number. The calculator should reset.
 *
 * When a user presses a key number and the calculator is expecting a result chain,
 * resultChanining will trigger @function resetCalculator() when evaluated.
 */
let resultChanining = false;

/* Assign click listener & handlers for numbers & operators:
==============================================================================*/
equalBtn.addEventListener('click', calculate);
decimalBtn.addEventListener('click', decimalHandler);
clearBtn.addEventListener('click', resetCalculator);
operators.forEach(operator => operator.addEventListener('click', operatorHandler));
numbers.forEach(number => number.addEventListener('click', numberHandler));

/* numberHandler:                                           this#As_a_DOM_event_handler
==============================================================================*/
function numberHandler() {
  let number = this.getAttribute('data-value');
  if (!resultChanining) {
    register = (register !== null) ? register += number : number;
    history += number;
    tracker.innerHTML = history;
    display.innerHTML = register;
    operatorLocker = false;
  } else {
    resetCalculator();
  }
}

/* operatorHandler:
==============================================================================*/
/** @function operatorHandler()
 * As operators are used after inputting a number. operatorHandler() takes @var memory length
 * into considerations to assess each operational situation:
 *
 * - If memory.length === 0:
 *     User inputted a number before calling the operator.
 *     Parse and push that number from @var register,
 *     and then push @var operator to @var memory.
 *
 * - If memory.length === 1:
 *     resultChanining is true, the memory already have a number and the calculator is
 *     expecting @var operator only. Push @var operator to @var memory.
 *
 * - If memory.length === 2:
 *     There is already a number and an operator inside memory. Therefore,
 *     User inputted a number before calling the operator.
 *        Use the inputted number and find the result of both numbers:
 *          math(memory[0],memory[1],parseFloat(register)
 *        Push the @var result to @var memory, clear @var register,
 *        and then push the new @var operator to @var memory.
 *
 * Afterwards, sanitize some values and update the tracker.
 */
function operatorHandler() {
  if (!operatorLocker) {
    let operator = this.getAttribute('data-value');

    switch (memory.length) {
      case 0:
        register = parseFloat(register);
        memory.push(register);
        register = null;
        memory.push(operator);
        break;
      case 1:
        register = null;
        memory.push(operator);
        break;
      case 2:
        let result = math(memory[0],memory[1],parseFloat(register));
        memory   = [result];
        register = null;
        memory.push(operator);
        display.innerHTML = resultDisplay(result);
        break;
      default:
        resetCalculator();
        display.innerHTML = "Operator Error";
    }

    history  += operator;
    tracker.innerHTML = history;
    operatorLocker = true;
    resultChanining= false;
    decimalBtn.removeEventListener('click', decimalHandler);
    decimalBtn.addEventListener('click', decimalHandler);
  }
  console.log(memory);
}

/* calculate:
==============================================================================*/
/** @function calculate()
 * calculate will produce the output of two numbers if the
 * memory.length === 2 and the calculator is not expecting an operator.
 *
 * NOTE:
 * @const equalBtn is an operator itself, so if the user had inputted a number and
 * an operator (memory.length === 2), you still won't be able to use @function calculate()
 * to produce an output, as the @var operatorLocker is true from @function operatorHandler().
 *
 * A user needs to input another number so @function numberHandler will turn -
 * @var operatorLocker to false again.
 */
function calculate() {
  if (!operatorLocker && memory.length === 2) {
    let result = math(memory[0],memory[1],parseFloat(register));
    register = null;
    resultChanining = true;
    memory   = [result];
    display.innerHTML = resultDisplay(result);
    decimalBtn.removeEventListener('click', decimalHandler);
    decimalBtn.addEventListener('click', decimalHandler);
  }
  console.log(memory);
}

/* Result Display:
==============================================================================*/
/**
 * Use the rounding algorithm to prevent overflow from float numbers.
 * If the number is too big (>= 1e+8), return a string representing the
 * Number object in exponential notation
 */
function resultDisplay(number) {
  number = roundNumber(number, 3);
  return (number >= 1e+8) ? number.toExponential(3) : number;
}

/* Rounding algorithm:                              http://stackoverflow.com/a/12830454
==============================================================================*/
/**
 * A rounding algorithm to handle JavaScript's rounding errors.
 * @param  {Number}  num    the number to round
 * @param  {Number}  scale  how many decimal places to keep
 */
function roundNumber(num, scale) {
  var number = Math.round(num * Math.pow(10, scale)) / Math.pow(10, scale);
  if(num - number > 0) {
    return (number + Math.floor(
      2 * Math.round(
        (num - number) * Math.pow(10, (scale + 1))
      ) / 10
    ) / Math.pow(10, scale));
  } else {
    return number;
  }
}

/* Math:
==============================================================================*/
function math(a,b,c) {
  let result = 0;
  switch (b) {
    case '/':
      result = (a/c);
      break;
    case '*':
      result = (a*c);
      break;
    case '+':
      result = (a+c);
      break;
    case '-':
      result = (a-c);
      break;
    default:
      resetCalculator();
      display.innerHTML = "Math Error";
  }
  return result;
}

/* decimalHandler:
==============================================================================*/
function decimalHandler() {
  this.removeEventListener('click', decimalHandler);
  if (!resultChanining) {
    register = (register !== null) ?  register+= '.' : '0.';
    history  = (register !== null) ?  history += '.' : '0.';
    display.innerHTML = register;
    tracker.innerHTML = history;
  } else {
    resetCalculator();
  }
}

/* resetCalculator:
==============================================================================*/
function resetCalculator() {
  memory          = [];
  history         = '';
  register        = null;
  operatorLocker  = true;
  resultChanining = false;
  display.innerHTML = 0;
  tracker.innerHTML = 'Standard';
  decimalBtn.removeEventListener('click', decimalHandler);
  decimalBtn.addEventListener('click', decimalHandler);
}

/* Adding project Details
==============================================================================*/
addProjDetails(0, 'Project Overview', 'This is a JavaScript calculator with a standard functionality. You can calculate and chain your previous results to perform further mathematical operations. There is also a history panel to track your input.');
addProjDetails(0, 'Techniques/Technologies', 'There is nothing special used to build this calculator. basic HTML, basic CSS, and basic JavaScript. However, lots of thought was put to make this calculator error free. While looking at other similar JavaScript calculators, I have seen many implementation which where prone to lots of errors and bugs. So I believe the actual challenge for this project was to make something functional and error-free.');

addProjDetails(1, 'Hurdles encountered', 'Due to the way float numbers are built in JavaScript. There is a rounding error that can\'t be completely avoided. I had to search around for a suitable rounding algorithm to help me reducing this margin of rounding error. <a href="https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html" target="_blank">Read more about floating-point arithmetic</a>...');
addProjDetails(1, 'Future implementations', 'I can add the modulus, root, or sign operator. But this is as simple as adding the other operators with a bit of mathematical considerations. This is not an important feature, so unless directly requested for educative purposes, it is not worth building.');
addProjDetails(1, 'Reflection', 'This project looks simple at first. But doing it right required lots of determination.');
