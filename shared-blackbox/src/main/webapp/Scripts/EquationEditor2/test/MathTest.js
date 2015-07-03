//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
var MATH_TO_TEST = ['<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mi>x</mi><mo>≤</mo><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mi>x</mi><mo>-</mo><mn>3</mn><mo>=</mo><mn>2</mn><mi>x</mi><mo>-</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>7</mn><mi>x</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mi>y</mi><mo>=</mo><mi>x</mi><msqrt><mrow><mn>2</mn></mrow></msqrt></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>3</mn><mo>-</mo><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn><mi>x</mi><mo>-</mo><mn>1</mn><mn>7</mn><mo>=</mo><mn>5</mn><mi>x</mi><mo>+</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>b</mi><mo>+</mo><mi>c</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mi>x</mi><mo>+</mo><mn>4</mn><mo>=</mo><mn>2</mn><mi>x</mi><mo>-</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>×</mo><mn>5</mn><mo>+</mo><mn>5</mn><mo>=</mo><mo>-</mo><mn>1</mn><mo>×</mo><mn>5</mn><mo>-</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mi>x</mi><mo>+</mo><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>+</mo><mn>2</mn><mo>≥</mo><mi>x</mi><mo>-</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>0</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mn>3</mn><mi>x</mi><mo>+</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mi>x</mi><mo>-</mo><mn>2</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>-</mo><mn>5</mn><mi>b</mi><mo>+</mo><mn>6</mn><mo>=</mo><mn>5</mn><mi>b</mi><mo>+</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mi>x</mi><mo>+</mo><mn>3</mn><mi>x</mi><mo>-</mo><mn>2</mn><mo>×</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><msqrt><mrow><mn>6</mn><mi>x</mi></mrow></msqrt></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn><mo>≥</mo><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mi>x</mi><mo>+</mo><mn>8</mn><mo>=</mo><mn>2</mn><mi>x</mi><mo>-</mo><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mi>x</mi><mo>+</mo><mn>5</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mi>x</mi><mo>+</mo><mn>2</mn><mo>=</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>+</mo><mn>3</mn><mo>≤</mo><mn>4</mn><mo>-</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mfrac><mrow><mn>2</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>0</mn><mi>y</mi><mo>=</mo><mn>1</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mo>-</mo><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>6</mn><mo>-</mo><mn>5</mn><mo>)</mo><mo>+</mo><mo>(</mo><mn>4</mn><mo>-</mo><mn>3</mn><mo>)</mo><mo>-</mo><mn>2</mn><mo>(</mo><mo>+</mo><mn>2</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>5</mn><mo>×</mo><mn>4</mn><mo>÷</mo><mn>2</mn><mo>)</mo><mo>-</mo><mn>6</mn><mo>+</mo><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>c</mi><mo>×</mo><mn>4</mn><mo>=</mo><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>6</mn><mo>-</mo><mn>5</mn><mo>=</mo><mn>1</mn><mo>)</mo><mfenced open="|" close="|"><mrow><mo>(</mo><mn>5</mn><mo>-</mo><mn>4</mn><mo>=</mo><mn>1</mn><mo>)</mo></mrow></mfenced><mo>(</mo><mn>4</mn><mo>-</mo><mn>3</mn><mo>=</mo><mn>1</mn><mo>)</mo><mfenced open="|" close="|"><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>2</mn><mo>=</mo><mn>1</mn><mo>)</mo></mrow></mfenced><mo>(</mo><mn>2</mn><mo>-</mo><mn>1</mn><mo>=</mo><mn>1</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>6</mn><mo>÷</mo><mn>3</mn><mo>)</mo><mo>+</mo><mn>5</mn><mo>-</mo><mn>4</mn><mo>-</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>×</mo><mn>5</mn><mo>=</mo><mn>3</mn><mn>0</mn><mo>-</mo><mn>4</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>2</mn><mn>9</mn><mo>+</mo><mn>2</mn><mo>=</mo><mn>3</mn><mn>1</mn><mo>÷</mo><mn>3</mn><mn>1</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mo>×</mo><mn>3</mn><mo>-</mo><mn>6</mn><mo>+</mo><mn>5</mn><mo>-</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>b</mi><mo>+</mo><mn>3</mn><mo>=</mo><mn>8</mn><mo>÷</mo><mn>2</mn><mo>=</mo><mn>4</mn><mo>-</mo><mn>4</mn><mo>=</mo><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>+</mo><mn>5</mn><mo>=</mo><mn>1</mn><mn>1</mn><mo>-</mo><mn>4</mn><mo>=</mo><mn>7</mn><mo>-</mo><mn>3</mn><mo>=</mo><mn>4</mn><mo>-</mo><mn>2</mn><mo>=</mo><mn>2</mn><mo>-</mo><mn>1</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mo>(</mo><mn>6</mn><mo>+</mo><mn>4</mn><mo>)</mo><mo>-</mo><mo>(</mo><mn>5</mn><mo>+</mo><mn>3</mn><mo>)</mo><mo>÷</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>÷</mo><mn>1</mn><mn>5</mn><mo>÷</mo><mn>1</mn><mn>4</mn><mo>÷</mo><mn>1</mn><mn>3</mn><mo>÷</mo><mn>1</mn><mn>2</mn><mo>÷</mo><mn>1</mn><mn>1</mn><mo>+</mo><mn>1</mn><mo>=</mo><mn>2</mn><mn>2</mn><mo>-</mo><mn>1</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>6</mn><mo>-</mo><mn>5</mn><mo>)</mo><mo>+</mo><mo>(</mo><mn>4</mn><mo>-</mo><mn>3</mn><mo>)</mo><mo>-</mo><mn>2</mn><mo>+</mo><mn>1</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>÷</mo><mn>3</mn><mn>6</mn><mo>=</mo><mn>6</mn><mo>-</mo><mn>2</mn><mo>=</mo><mn>4</mn><mo>-</mo><mn>3</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>2</mn><mo>-</mo><mn>5</mn><mo>-</mo><mn>3</mn><mo>-</mo><mn>3</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>-</mo><mn>5</mn><mo>=</mo><mn>1</mn><mo>=</mo><mn>4</mn><mo>-</mo><mn>3</mn><mo>=</mo><mn>1</mn><mo>=</mo><mn>5</mn><mo>-</mo><mn>4</mn><mo>=</mo><mn>1</mn><mo>=</mo><mn>3</mn><mo>-</mo><mn>2</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mo>+</mo><mn>5</mn><mo>+</mo><mn>4</mn><mo>-</mo><mn>6</mn><mo>-</mo><mn>3</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn><mo>+</mo><mn>3</mn><mo>-</mo><mn>6</mn><mo>+</mo><mn>4</mn><mo>-</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>+</mo><mn>4</mn><mo>=</mo><mn>1</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn><mo>+</mo><mn>3</mn><mo>+</mo><mn>2</mn><mo>=</mo><mn>1</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>0</mn><mo>÷</mo><mn>1</mn><mn>0</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn><mo>+</mo><mn>2</mn><mo>+</mo><mn>3</mn><mo>-</mo><mn>6</mn><mo>-</mo><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mo>-</mo><mn>5</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>3</mn><mi>y</mi><mo>)</mo><mo>=</mo><mo>(</mo><mo>-</mo><mn>8</mn><mi>y</mi><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mi>x</mi><mo>-</mo><mn>8</mn><mi>x</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><mo>(</mo><mi>x</mi><mo>-</mo><mn>3</mn><mo>)</mo><mo>(</mo><mi>x</mi><mo>+</mo><mn>8</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mo>(</mo><mi>x</mi><mo>-</mo><mn>3</mn><mo>)</mo><mo>(</mo><mi>x</mi><mo>+</mo><mn>8</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mi>x</mi><mo>+</mo><mo>(</mo><mo>-</mo><mn>8</mn><mi>y</mi><mo>)</mo><mo>=</mo><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mo>(</mo><mi>x</mi><mo>-</mo><mn>3</mn><mo>)</mo><mo>(</mo><mi>x</mi><mo>+</mo><mn>8</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>5</mn><mo>.</mo><mn>0</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>tan</mo><mfrac><mrow><mo>-</mo><mn>8</mn></mrow><mrow><mn>0</mn></mrow></mfrac><mo>×</mo><mo>cos</mo><mfrac><mrow><mn>3</mn></mrow><mrow><mn>0</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mn>3</mn><msup><mrow><mo>×</mo></mrow><mrow><mn>2</mn></mrow></msup></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mo>(</mo><mn>3</mn><mo>+</mo><mn>0</mn><mo>)</mo><mo>≠</mo><mo>(</mo><mn>5</mn><mo>-</mo><mn>5</mn><mo>)</mo><mi>y</mi><mo>=</mo><mo>(</mo><mo>-</mo><mn>8</mn><mo>+</mo><mn>0</mn><mo>)</mo><mo>&lt;</mo><mo>(</mo><mn>2</mn><mo>-</mo><mn>2</mn><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><msup><mrow><mi>x</mi></mrow><mrow><mn>2</mn></mrow></msup></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><msup><mrow><mi>x</mi></mrow><mrow><mn>2</mn></mrow></msup><mo>+</mo><mn>5</mn><mi>x</mi><mo>-</mo><mn>2</mn><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>2</mn></mrow><mrow><mn>1</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>b</mi><mo>=</mo><mi>b</mi><mo>+</mo><mo>.</mo><mn>7</mn><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>c</mi><mo>(</mo><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac><mo>)</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>+</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn><mo>=</mo><mn>2</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>=</mo><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>4</mn></mrow><mrow><mn>7</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>c</mi><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn><mi>c</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mo>=</mo><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn><mi>c</mi><mo>=</mo><mn>1</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mi>c</mi><mo>=</mo><mn>7</mn><mi>b</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>.</mo><mn>3</mn><mo>.</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>×</mo><mn>4</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>|</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>7</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>(</mo><mn>1</mn><mo>+</mo><mn>3</mn><mo>)</mo><mo>+</mo><mn>4</mn><mo>=</mo><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>=</mo><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>+</mo><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mi>c</mi><mo>=</mo><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>3</mn></mrow><mrow><mn>7</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mi>x</mi><mo>=</mo><mn>1</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn><mo>=</mo><mn>1</mn><mi>c</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>4</mn></mrow><mrow><mn>7</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mo>+</mo><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mi>c</mi><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn><mi>c</mi></mrow><mrow><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn><mi>b</mi></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>|</mo><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mn>7</mn><mo>÷</mo><mn>4</mn><mi>c</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn><mn>0</mn><mi>b</mi></mrow><mrow><mn>1</mn><mn>1</mn><mi>c</mi></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac><mi>b</mi><mo>=</mo><mn>1</mn><mi>b</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>=</mo><mn>1</mn><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn><mi>c</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>1</mn><mo>.</mo><mn>7</mn><mn>5</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mi>x</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mfrac><mrow><mn>1</mn><mn>3</mn></mrow><mrow><mn>1</mn><mn>6</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mi>y</mi><mo>+</mo><mn>3</mn><mi>y</mi><mo>+</mo><mn>3</mn><mi>x</mi><mo>+</mo><mn>9</mn><mi>x</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>2</mn><mn>3</mn><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>2</mn><mi>x</mi><mo>+</mo><mn>9</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>2</mn><mi>x</mi><mo>+</mo><mn>9</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>9</mn><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>2</mn><mi>x</mi><mo>+</mo><mn>9</mn><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>2</mn><mo>×</mo><mi>x</mi><mo>+</mo><mn>9</mn><mo>×</mo><mi>y</mi></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>1</mn><mo>×</mo><mo>+</mo><mn>1</mn><mi>y</mi><mo>≥</mo><mn>1</mn><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>≤</mo><mi>y</mi><mo>&lt;</mo><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>≤</mo><mi>y</mi><mo>≤</mo><mn>2</mn><mfrac><mrow><mn>2</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mo>≤</mo><mi>y</mi><mo>≥</mo><mn>2</mn><mfrac><mrow><mn>2</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>1</mn><mo>+</mo><mn>2</mn><mo>≥</mo><mn>1</mn><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn><mn>0</mn><mo>×</mo><mn>1</mn><mn>1</mn><mo>+</mo><mn>3</mn><mn>0</mn><mo>×</mo><mn>2</mn><mo>≤</mo><mn>3</mn><mn>0</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mn>2</mn><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>≤</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>≥</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>≤</mo><mn>2</mn><mn>8</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mo>≥</mo><mn>1</mn><mo>≥</mo><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>8</mn></mrow><mrow><mn>3</mn></mrow></mfrac><mo>≥</mo><mi>y</mi><mo>≥</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>y</mi><mo>=</mo><mo>-</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mo>×</mo><mn>9</mn><mo>=</mo><mn>3</mn><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mo>×</mo><mn>6</mn><mo>=</mo><mn>3</mn><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>1</mn><mn>2</mn><mo>=</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>×</mo><mn>4</mn><mo>=</mo><mn>1</mn><mn>4</mn><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>9</mn><mo>=</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>×</mo><mn>4</mn><mo>=</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>9</mn><mo>×</mo><mn>4</mn><mo>=</mo><mn>3</mn><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mo>÷</mo><mn>3</mn><mn>6</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>×</mo><mn>4</mn><mo>=</mo><mn>1</mn><mn>5</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mo>×</mo><mn>8</mn><mo>=</mo><mn>3</mn><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>1</mn><mn>2</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>8</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>6</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>9</mn><mn>0</mn><mo>+</mo><mn>7</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>0</mn><mo>+</mo><mn>6</mn><mn>0</mn><mo>=</mo><mn>9</mn><mn>0</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mo>+</mo><mn>6</mn><mo>=</mo><mn>9</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>.</mo><mn>6</mn><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>0</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>6</mn><mn>0</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mo>+</mo><mn>6</mn><mo>=</mo><mn>9</mn><mn>4</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>0</mn><mo>×</mo><mn>4</mn><mo>+</mo><mn>6</mn><mo>+</mo><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>6</mn><mn>0</mn><mo>+</mo><mn>3</mn><mn>0</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>0</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>6</mn><mn>0</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>0</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>6</mn><mn>0</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>8</mn><mn>0</mn><mo>+</mo><mn>7</mn><mo>=</mo><mn>8</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>.</mo><mn>3</mn><mn>4</mn><mo>×</mo><mo>.</mo><mn>6</mn><mn>3</mn><mo>=</mo><mo>.</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>4</mn><mo>+</mo><mn>6</mn><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mn>0</mn><mo>+</mo><mn>6</mn><mn>0</mn><mo>=</mo><mn>9</mn><mn>0</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>3</mn><mo>=</mo><mn>9</mn><mn>7</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>4</mn></mrow><mrow><mn>3</mn><mo>+</mo><mfrac><mrow><mn>3</mn></mrow><mrow><mn>6</mn></mrow></mfrac></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>3</mn></mrow><mrow><mn>1</mn><mn>0</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>0</mn><mo>.</mo><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>4</mn><mfrac><mrow><mn>1</mn></mrow><mrow><mn>2</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>2</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>0</mn><mo>.</mo><mn>2</mn><mn>3</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>2</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>8</mn></mrow><mrow><mn>2</mn><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mo>.</mo><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>0</mn><mo>.</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>1</mn><mn>0</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn><mn>2</mn></mrow><mrow><mn>8</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>5</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>0</mn></mrow><mrow><mn>3</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mfrac><mrow><mn>1</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>0</mn><mfrac><mrow><mn>1</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>=</mo><mn>6</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>0</mn><mo>&lt;</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>&lt;</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mn>3</mn><mo>&lt;</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mo>≥</mo><mn>1</mn></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mstyle displaystyle="true"><mi>x</mi><mo>=</mo><mn>3</mn></mstyle></math>'
];
