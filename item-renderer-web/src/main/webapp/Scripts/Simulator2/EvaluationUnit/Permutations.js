//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿
/**
 * *****************************************************************************
 * @class Permutation 
 * @superclass 
 * @param none
 * @return - instance of Permutation
 * 
 *******************************************************************************
 */
SimParser.Permutation = function(vars) {
    
    // Instance variables
    var n = vars.length; // number of variables
    var pia = []; // array of indexes pointing to the current permutation
    var piv = []; // number of possible values of each variable
    var rs = [];  // resulting array

    // initialize class variables values
    var init = function () {
        rs = [];
        for (var i = 0; i < n; i++) {
            pia[i] = 0;
            piv[i] = vars[i].length - 1;
        }
    }
    
    // 'increment' pia by 1 producing next permutation
    var next = function () {
        for (var i = n - 1; i >= 0; i--) {
            if (pia[i] < piv[i]) {
                pia[i]++;
                return true;
            }
            // back track
            else {
                var j = i - 1;
                while ((j >= 0) && (pia[j] === piv[j])) j--;
                // reach an end
                if (j < 0) {
                    return false
                } else {
                    pia[j]++;
                    for (var k = j + 1; k <= i; k++) pia[k] = 0;
                    return true;
                }
            }
        }
    }

    // return the current permutation
    var currentPermutation = function () {
        var cp = [];
        for (i = 0; i < n; i++) {
            cp.push(vars[i][pia[i]]);
        }
        return cp;
    }

    // return all possible permutations to an array
    var run = function () {
        init();
        do {
            rs.push(currentPermutation());
        }
        while (next());
        return rs;
    }
    
    return run();
    
};