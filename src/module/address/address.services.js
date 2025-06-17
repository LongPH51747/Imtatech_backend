const Address = require("./address.model");

exports.create = async (addreesCreate, userId) => {
  try {
    if (addreesCreate.is_default == true) {
      await Address.updateMany({ userId: userId }, { is_default: false });
    }
    const newAddress = new Address({
      userId: userId,
      fullName: addreesCreate.fullName,
      addressDetail: addreesCreate.addressDetail,
      phone_number: addreesCreate.phone_number,
      is_default: addreesCreate.is_default,
    });

    const saveAddress = await newAddress.save();
    return saveAddress;
  } catch (error) {
    console.log(error);
  }
};

exports.get = async () => {
  try {
    const getData = await Address.find();
    return getData;
  } catch (error) {
    console.log(error);
  }
};

exports.getByUserId = async (userId) => {
  try {
    const dataAddress = await Address.find({userId: userId})
    return dataAddress
  } catch (error) {
    console.log(error);
  }
};

exports.update = async (addressUpdate, id, res) => {
  try {
    const update = await Address.findById(id);

    console.log(update);

    if (!update) {
      return res
        .status(404)
        .json({ message: "Failed to update address in address.services" });
    }

    update.fullName = addressUpdate.fullName;
    update.addressDetail = addressUpdate.addressDetail;
    update.phone_number = addressUpdate.phone_number;

    await update.save();

    console.log(update);

    return update;
  } catch (error) {
    console.log(error);
  }
};

exports.updateIsDefault = async (id, userId, res) => {
  try {
    console.log(userId);

    await Address.updateMany({ userId: userId }, { is_default: false });

    // const updateIsDefault = await Address.findByIdAndUpdate(id, {
    //   is_default: true,
    // });

    const updateIsDefault = await Address.findById(id);

    if (updateIsDefault.userId != userId) {
      return null;
    }

    updateIsDefault.is_default = true;

    await updateIsDefault.save();
    console.log("updateIsDefault", updateIsDefault);

    return updateIsDefault;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to update is_default in address.services" });
  }
};

exports.getById = async (id) => {
  try {
    const addressDetail = await Address.findById(id)
    return addressDetail
  } catch (error) {
    error.statusCode = 500
    throw error
  }
}

exports.deleteAddress = async (id) => {
  try {
    const deleteAddress = await Address.findByIdAndDelete(id)
    return deleteAddress
  } catch (error) {
    error.statusCode = 500
    throw error
  }
}