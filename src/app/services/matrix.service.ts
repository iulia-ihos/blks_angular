//Rotates the provided matrix by provided degrees counterclockwise
export function rotateMatrix(matrix, degrees){  

    if(degrees == 90){
      //For 90 degrees swap the height/width and swap the location of each element
      var output = Array.apply(null, Array(matrix[0].length)).map(function(){return []});

      for(var i = 0; i < matrix[0].length; i++){
        for(var j = 0; j < matrix.length; j++){
          output[i][j] = matrix[j][i];
        }
      }    
    } else if(degrees == 180) {
      //For 180 degrees, rebuild array backwards
      var output =  Array.apply(null, Array(matrix.length)).map(function(){return []});
      for(var i = matrix.length - 1; i >= 0; i--){
        for(var j = matrix[0].length - 1; j >=0; j--){
          output[matrix.length - 1 - i][matrix[0].length - 1 - j] = matrix[i][j];
        }
      }    
    } else if(degrees == 270) {
      //For 270 degrees, not sure how to make short description
      var output = Array.apply(null, Array(matrix[0].length)).map(function(){return []});
      //Swapping the width and height for non square matrices

      for(var i = 0; i < matrix[0].length; i++){
        for(var j = matrix.length - 1; j >=0; j--){
          output[i][matrix.length - 1 - j] = matrix[j][i];
        }
      }      
    }   
    return output;
  }

  export function flipX(matrix){
   var output = Array.apply(null, Array(matrix.length)).map(function(){return []});
   var row = matrix.length - 1;
		for(var i = 0; i < matrix.length; i++) 
			for(var j = 0; j < matrix[0].length; j++) {
				output[row-i][j] = matrix[i][j];
			}
    return output;
  }

  export function flipY(matrix){
    var output = Array.apply(null, Array(matrix.length)).map(function(){return []});
    var col = matrix[0].length - 1;
		for(var i = 0; i < matrix.length; i++) 
			for(var j = 0; j < matrix[0].length; j++) {
				output[i][col-j] = matrix[i][j];
			}
    return output;
  }