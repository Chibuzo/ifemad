const uploadFile = async files => {
    if (!files || Object.keys(files).length === 0) {
        return null;
    }

    // check file type
    const ext = files.portfolio_photo.name.split('.').pop();
    const photoFile = files.portfolio_photo;
    const photoName = `portfolio_photos/${process.hrtime()[1]}.${ext}`;
    const uploadPath = require('path').resolve(__dirname, '../public', photoName);
    await photoFile.mv(uploadPath);
    return photoName;
}

module.exports = {
    uploadFile
}