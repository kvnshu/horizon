const MODEL_URL = './model/model.json';
const model = await tf.loadLayersModel(MODEL_URL);

async function predictSunset(humidity, cloudCover, visibility){
    let tensor = tf.tensor([[humidity, cloudCover, visibility]])
    return model.predict(tensor).array()
}

export {predictSunset}