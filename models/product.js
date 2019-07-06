'use strict'
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    'product',
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.INTEGER,
      img_url: DataTypes.TEXT
    },
    {}
  )

  product.associate = function(models) {
    // associations can be defined here
    product.belongsTo(models.category, {
      foreignKey: 'category_id'
    })
  }

  return product
}
