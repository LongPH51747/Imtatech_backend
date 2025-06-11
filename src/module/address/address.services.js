const Address = require("./address.model");

exports.create = async (addreesCreate) => {
  try {
    const newAddress = new Address({
      userId: addreesCreate.userId,
      fullName: addreesCreate.fullName,
      addressDetail: addreesCreate.addressDetail,
      phone_number: addreesCreate.phone_number,
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
    const dataAddress = await Address.findById(userId)
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
