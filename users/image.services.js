const { promisify } = require('util');
const fs = require('fs');
const mv = promisify(fs.rename);
const path = require('path')
var dir = './uploaded/';
const imagesJsonPath = path.join(__dirname, '..', 'tmp', 'images.json');

module.exports = {
    uploadImage,
    getImage,
    getAll,
    getImagesOfUserWithId
};

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const images = []

async function getAll() {
    // read images.json file
    // return the data accordingly
    // error handling if file doesn't exist
    ;
    if (!fs.existsSync(imagesJsonPath)) {
        return [];
    }
    const images = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

    // add a functionality, before returning the images info
    // check and compare the images names with the uploaded folder
    // if the folder doesn't have the image, remove the image from the images.json file
    // if the folder has the image, but the image is not in the images.json file, add the image to the images.json file
    // make use of the saveFile function to save the image in the uploaded folder
    // then proceed with the return operation
    // this will ensure that the images.json file is always in sync with the uploaded folder
    const imagesInFolder = fs.readdirSync(dir);
    const imagesInJson = images.map(image => image.image_name);
    const imagesToDelete = imagesInJson.filter(image => !imagesInFolder.includes(image));
    const imagesToAdd = imagesInFolder.filter(image => !imagesInJson.includes(image));
    // console.log(`infolder ${imagesInFolder} \ninjson ${imagesInJson} \ntodelete ${imagesToDelete} \ntoadd ${imagesToAdd}`);
    imagesToDelete.forEach(image => {
        const index = images.findIndex(img => img.image_name === image);
        images.splice(index, 1);
    }); // remove images that are not in the folder
    imagesToAdd.forEach(image => {
        const image_data = {
            id: ID(),
            image_name: image,
            date: new Date(),
            uploaded_by: 0
        };
        images.push(image_data);
    }); // add images that are not in the json file
    fs.writeFileSync(imagesJsonPath, JSON.stringify(images, null, 2), 'utf8');  // write the updated images.json file
    
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
    let name = filename;

    // Create the new image data
    let image_data = {
        id: ID(),
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
    };

    return moveItem().then(() => { return image_data });
}

async function getImage(id) {
    // read images.json file
    // return the data accordingly
    // error handling if file doesn't exist
    ;

    if (!fs.existsSync(imagesJsonPath)) {
        // return according error message if file doesn't exist
        return { status: 404, message: 'No images found' };
    }
    // also check if the image exists
    const images = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));
    // filter images based on id
    const image = images.find(image => image.id === id);
    // console.log(image);
    if (!image) {
        return { status: 404, message: 'No image found'};
    }
    return `./uploaded/${image.image_name}`;
}

async function getImagesOfUserWithId(userId) {
    // read images.json file
    // return the data accordingly
    // error handling if file doesn't exist
    ;
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
