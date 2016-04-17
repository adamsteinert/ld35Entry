//import EnableTracing from 'Constants';

export function trace(message) {
    //if(EnableTracing)
      console.log(message)
	}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
