/** **************************************************************************
* @class NextNumGenerator
* @superclass none
* @param none
* @return NextNumGenerator instance
* Creates a new NextNumGenerator data structure. Last In First Out.
*****************************************************************************
*/
Simulator.Utils.NumberGenerator = function (type) {

    var simItemNextNumber = 0;
    var defaultNextNumber = 0;

    this.getNext = function (type) {
        switch (type) {
            case 'SimItem': return simItemNextNumber++;
            default : return defaultNextNumber++;
        }
    };
};


