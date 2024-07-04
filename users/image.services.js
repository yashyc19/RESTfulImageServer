const { promisify } = require('util');
const fs = require('fs');
const mv = promisify(fs.rename);
const path = require('path')
var dir = './uploaded/';

module.exports = {
    uploadImage,
    getImage,
    getAll,
    getImagesOfUserWithId,
    saveImageList
};

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const images = []

async function getAll() {
    // read images.json file
    // return the data accordingly
    // error handling if file doesn't exist
    const imagesJsonPath = path.join(__dirname, '..', 'tmp','images.json');
    if (!fs.existsSync(imagesJsonPath)) {
        return [];
    }
    const images = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

    return images.map(image => {
        // I don't want to expose the user email
        const { user , ...imageWihtoutEmail } = image
        return imageWihtoutEmail
    })
}

async function uploadImage(userId, files) {
    let newFile = null;

    if (!fs.existsSync(dir)){
        console.log(dir + " doesn't exist, creating one.");
        fs.mkdirSync(dir);
    }

    try {
        if (!files) {
            return { status: 500, message: 'No file uploaded' };
        } else {
            newFile = files.image;
            const path = dir;

            let data = await saveFile(newFile.name, newFile.tempFilePath, path, userId);
            return data;
        }
    } catch (err) {
        console.log(err);
        throw "Something went wrong";
    }
}

async function saveFile(filename, oldPath, newPath, uploaderUserId) {
    let creation_date = new Date();
    let name = ID() + ' - ' + filename;

    // Step 1: Check for latestImageId.txt
    const latestIdPath = path.join(__dirname, '..', 'tmp', 'latestImageId.txt');
    if (!fs.existsSync(latestIdPath)) {
        fs.writeFileSync(latestIdPath, '0');
    }

    // Step 2: Determine the Next Image ID
    let latestId = parseInt(fs.readFileSync(latestIdPath, 'utf8'), 10);
    const imagesJsonPath = path.join(__dirname, '..', 'tmp', 'images.json');
    if (fs.existsSync(imagesJsonPath)) {
        const imagesData = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));
        if (imagesData.length > 0) {
            const maxId = imagesData.reduce((max, img) => Math.max(max, img.id), 0);
            latestId = maxId + 1;
        }
    }

    let image_data = {
        id: latestId,
        image_name: name,
        date: creation_date,
        uploaded_by: uploaderUserId
    };

    const moveItem = async () => {
        await mv(oldPath, newPath + image_data.image_name);

        // Initialize images.json if it doesn't exist
        if (!fs.existsSync(imagesJsonPath)) {
            fs.writeFileSync(imagesJsonPath, JSON.stringify([], null, 2));
        }

        // Read images.json
        const imagesData = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

        // Append new image data
        imagesData.push(image_data);

        // Write back to images.json
        fs.writeFileSync(imagesJsonPath, JSON.stringify(imagesData, null, 2), 'utf8');

        // Step 4: Update latestImageId.txt
        fs.writeFileSync(latestIdPath, latestId.toString());
    };

    return moveItem().then(() => { return image_data });
}

async function getImage(id) {
    // read images.json file
    // return the data accordingly
    // error handling if file doesn't exist
    const imagesJsonPath = path.join(__dirname, '..', 'tmp', 'images.json');
    id = parseInt(id, 10);  // convert id to integer

    if (!fs.existsSync(imagesJsonPath)) {
        // return according error message if file doesn't exist
        return { status: 404, message: 'No images found' };
    }
    // also check if the image exists
    const images = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));
    // filter images based on id
    const image = images.find(image => image.id === id);
    console.log(image);
    if (!image) {
        return { status: 404, message: 'No image found'};
    }
    return `./uploaded/${image.image_name}`;
}

async function getImagesOfUserWithId(userId) {
    // read images.json file
    // return the data accordingly
    // error handling if file doesn't exist
    const imagesJsonPath = path.join(__dirname, '..', 'tmp', 'images.json');
    userId = parseInt(userId, 10);  // convert userId to integer

    if (!fs.existsSync(imagesJsonPath)) {
        // return according error message if file doesn't exist
        return { status: 404, message: 'No images found' };
    }

    const images = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));
    // filter images based on uploaded_by
    const imagesOfUser = images.filter(image => image.uploaded_by === userId);
    return imagesOfUser;
}

async function saveImageList(imagList) {
    // save the images that are selected by the user
    // compare with the images.json file by id and save the images in selectedImages.json
    // return the data accordingly
    // error handling if file doesn't exist
    const selectedImagesJsonPath = path.join(__dirname, '..', 'tmp', 'selectedImages.json');
    if (!fs.existsSync(selectedImagesJsonPath)) {
        fs.writeFileSync(selectedImagesJsonPath, JSON.stringify([], null, 2));
    }

    // const selectedImages = JSON.parse(fs.readFileSync(selectedImagesJsonPath, 'utf8'));
    // const imagesJsonPath = path.join(__dirname, '..', 'images.json');
    // const images = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

    // const selectedImageIds = imagList.map(image => image.id);
    // const selectedImagesData = images.filter(image => selectedImageIds.includes(image.id));

    // selectedImages.push(...selectedImagesData);
    // fs.writeFileSync(selectedImagesJsonPath, JSON.stringify(selectedImages, null, 2), 'utf8');
    // return selectedImagesData;
}