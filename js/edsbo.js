"use strict";
var MAX_UTILITY_MOUNTS = 8;

// pulled from http://elite-dangerous.wikia.com/wiki/Shield_Booster
var BOOSTERS = [
    // [class, power, multiplier, mass]
    ["A", 1.2, 0.20, 3.5],
    ["B", 1.0, 0.16, 3.0],
    ["C", 0.7, 0.12, 2.0],
    ["D", 0.5, 0.08, 1.0],
    ["E", 0.2, 0.04, 0.5]
];
var BLANK_COMB = ["", 0, 1, 0];

function populateUtilityMountInput() {
    var select = $("select#utility-mount-input");
    for (var i=1; i <= MAX_UTILITY_MOUNTS; i++)
        select.append($("<option/>").val(i).text(i));
}

function handleCalculate() {
    if (!$("form#sbo-form").valid())
        return;
        
    var result = calc(
        $("select#utility-mount-input").val(),
        $("input#power-input").val()
    );
    var formatted = formatResult(result);

    $("p#result-text").html(formatted);
}

var helperCallCount;

function calc(numMounts, power) {
    power = power || Number.MAX_VALUE;
    
    // Don't consider boosters that we can't afford even one of.
    var index = 0;
    for (; index < BOOSTERS.length; index++)
        if (BOOSTERS[index][1] <= power)
            break;
    
    helperCallCount = 0;
    var result = calcHelper(BLANK_COMB, numMounts, power, index);
    console.debug("debug: " + result);
    console.debug("debug: " + helperCallCount);
    
    return result;
}

function calcHelper(comb, numMounts, power, index) {
    helperCallCount++;
    
    var max_comb = null;
    for (var i=index; i < BOOSTERS.length; i++) {
        var new_comb = combine(comb, BOOSTERS[i]);
        
        var best_comb;
        if (new_comb[1] > power)
            // We've exceeded our power budget, so go back to the last good
            // combination.
            best_comb = comb;
        else if (new_comb[0].length < numMounts)
            // More utility mounts to fill? Let's see what we can do!
            best_comb = calcHelper(new_comb, numMounts, power, i);
        else
            // We've filled all of the mounts, so we stop recursing and
            // consider this combination.
            best_comb = new_comb;
        
        if (
            max_comb === null
            || best_comb[2] > max_comb[2] // a bigger multiplier is better
            || (best_comb[2] === max_comb[2] && best_comb[3] < max_comb[3]) // a smaller mass is better
        )
            max_comb = best_comb;
    }
    return max_comb;
}

function combine(one, two) {
    return [
        one[0] + two[0],
        parseFloat((one[1] + two[1]).toFixed(5)),
        parseFloat((one[2] + two[2]).toFixed(5)),
        parseFloat((one[3] + two[3]).toFixed(5))
    ];
}

function formatResult(result) {
    var classes = result[0];
    var power = result[1].toFixed(2);
    var multipler = parseFloat(result[2].toFixed(3));
    
    var formatted = "";
    var currentChr = classes[0];
    var count = 1;
    for (var i=1; i < classes.length; i++) {
        var chr = classes[i];
        if (chr === currentChr)
            count++;
        else {
            formatted += count + " x Class " + currentChr + "<br>";
            currentChr = chr;
            count = 1;
        }
    }
    formatted += count + " x Class " + currentChr + "<br>";
    formatted += "Total Power Used: " + power + " MW" + "<br>";
    formatted += "Total Shield Multiplier: " + multipler + "x";
    
    return formatted;
}

$(function() {
    populateUtilityMountInput();
    $("button#calc-button").click(handleCalculate);
});
