const addressService = require("./address.services");

exports.create = async(req, res) => {
  try {
    const addressCreate = req.body;
    if (!addressCreate.userId) {
      return res.status(400).json({message: "Failed to create beacause your userId cannot found"})
    }
    console.log(addressCreate);
    
    const saveAddress = await addressService.create(addressCreate)

    return res.status(200).json(saveAddress)
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to create", error})
  }
};

//check is_default chỉ có duy nhất 1 True 

exports.get = async(req, res) => {
  try {
    const getDataAddress = await addressService.get()
    if (!getDataAddress) {
        return res.status(404).json({message: "Cannot found address in addressContronller"})
    }
    return res.status(200).json(getDataAddress)
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to get address in addressController", error})
  }
}

exports.getAddressByUserID = async(req, res) => {
  try {
    const {userId} = req.params
    const getDataAddress = await addressService.getByUserId(userId)
    if (!getDataAddress) {
        return res.status(404).json({message: "Cannot found address in addressContronller"})
    }
    return res.status(200).json(getDataAddress)
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to get address in addressController", error})
  }
}

exports.update = async(req, res) => {
  try {
    const {id} = req.params
    const addressUpdate = req.body

    console.log(addressUpdate);
    
    const dataAdddress = await addressService.update(addressUpdate, id, res);
    if (!dataAdddress) {
      return res.status(404).json({message: "Address not found in address.controller"})
    }

    return res.status(200).json(dataAdddress)

  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Failed to update address in address.contronller"})
  }
}

exports.updateIsDefault = async(req, res) => {
  try {
    const {id} = req.params
    const userId = req.body.userId;
    
    const updateIsDefault = await addressService.updateIsDefault(id, userId, res);
    if (!updateIsDefault) {
      return res.status(404).json({message: "Cannot fount address in address.contronller"})
    }

    return res.status(200).json(updateIsDefault);

  } catch (error) {
    return res.status(500).json({message: "Failed to update is_default in address.contronller"})
  }
}