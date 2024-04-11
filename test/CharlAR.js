const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("CharlAR", function () {
  let charlar

  beforeEach(async () => {
    [deployer,user] = await ethers.getSigners()

    const CharlAR = await ethers.getContractFactory("CharlAR")
    charlar = await CharlAR.deploy()

    const transaction = await charlar.connect(deployer).create_channel("general", tokens(1))
    await transaction.wait()
  })

  describe("Deployment", function () {
    it("Sets the right name", async () => {
      let name = await charlar.name()
      expect(name).to.equal("CharlAR")
    })

    it("Sets the right symbol", async () => { 
      let symbol = await charlar.symbol()
      expect(symbol).to.equal("CHRLR")
    })

    it("Sets the owner", async () => {
      const owner = await charlar.owner()

      expect(owner).to.equal(deployer.address)
    })
  })

  describe("Creating Channels", () => {
    it("returns channel attributes", async () => {
      const channel = await charlar.get_channel(1)
      expect(channel.id).to.equal(1)
      expect(channel.name).to.equal("general")
      expect(channel.cost_to_join).to.equal(tokens(1))
    })
  })

  describe("Joining Channels", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("1", "ether")

    beforeEach( async () => {
      const transaction = await charlar.connect(user).mint_nft_to_join_channel(ID, {value: AMOUNT})
      await transaction.wait()
    })

    it("joins the user", async () => {
      const result = await charlar.has_joined_channel(ID, user.address)
      expect(result).to.equal(true)
    })

    it("increases total suply", async () => {
      const result = await charlar.total_supply()
      expect(result).to.be.equal(ID)
    })

    it("updates contracts balance", async () => {
      const result = await ethers.provider.getBalance(charlar.address)
      expect(result).to.be.equal(AMOUNT)
    })
  })

  describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", "ether")
    let balance_before

    beforeEach(async () => {
      balance_before = await ethers.provider.getBalance(user.address)
      let transaction = await charlar.connect(user).mint_nft_to_join_channel(ID, {value: AMOUNT})
      await transaction.wait()

      transaction = await charlar.connect(deployer).withdraw()
      await transaction.wait()

      it("updates owner balance", async () => {
        const balance_after = await ethers.provider.getBalance(user.address)
        expect(balance_after).to.be.gt(balance_before)
      })

      it("updates contracts balance", async () => {
        const result = await ethers.provider.getBalance(charlar.address)
        expect(result).to.be.equal(0)
      })
    })
  })
})
