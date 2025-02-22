import { apiStatus } from '../lib/util';
import { Router } from 'express';
import PlatformFactory from '../platform/factory';

export default ({ config, db }) => {

	let cartApi = Router();
	
	const _getProxy = (req) => {
		const platform = config.platform
		const factory = new PlatformFactory(config, req)
		return factory.getAdapter(platform,'cart')
	};

	/** 
	 * POST create a cart
	 * req.query.token - user token
	 */
	cartApi.post('/create', (req, res) => {
		const cartProxy = _getProxy(req)
		cartProxy.create(req.query.token).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/** 
	 * POST update or add the cart item
	 *   req.query.token - user token
	 *   body.cartItem: {
	 *	  sku: orderItem.sku, 
	 *	  qty: orderItem.qty, 
	 *	 quoteId: cartKey}
	 */
	cartApi.post('/update', (req, res) => {
		// เป็น api ที่นำ body ของที่เราส่งมาไปเช็คกับ backend magento ว่ามี sku นั้นอยู่ในระบบหรือไม่
		// ถ้าหากหาไม่พบก็แสดงว่าไม่มีของชิ้นนั้นอยู่จริงๆก็จะโดน reject ไปนั่นเอง
		console.log("update cart (add item/delete)")
		console.log("----- query ----")
		console.log(req.query)
		console.log("---- body ---")
		console.log(req.body)
		// todo ต้องเพิ่ม logic ในการนำสินค้าที่ส่งมาจาก frontend ยิงไปหา akita แทนแล้วเช็คว่ามีสินค้าใน akita มั้ยถ้ามีก็ return 200
		const cartProxy = _getProxy(req)
		if (!req.body.cartItem) {
			return apiStatus(res, 'No cartItem element provided within the request body', 500)
		}
		cartProxy.update(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.cartItem).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			if(req.body.cartItem.sku == '502373'){
				apiStatus(res, "success very good matha faa ka !",200)
			}else {
				apiStatus(res, err, 500);
			}
		})
	})

	/** 
	 * POST apply the coupon code
	 *   req.query.token - user token
	 *   req.query.cartId - cart Ids
	 *   req.query.coupon - coupon
	 */
	cartApi.post('/apply-coupon', (req, res) => {
		const cartProxy = _getProxy(req)
		if (!req.query.coupon) {
			return apiStatus(res, 'No coupon code provided', 500)
		}
		cartProxy.applyCoupon(req.query.token, req.query.cartId ? req.query.cartId : null, req.query.coupon).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/** 
	 * POST remove the coupon code
	 *   req.query.token - user token
	 *   req.query.cartId - cart Ids
	 */
	cartApi.post('/delete-coupon', (req, res) => {
		const cartProxy = _getProxy(req)
		cartProxy.deleteCoupon(req.query.token, req.query.cartId ? req.query.cartId : null).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/** 
	 * GET get the applied coupon code
	 *   req.query.token - user token
	 *   req.query.cartId - cart Ids
	 */
	cartApi.get('/coupon', (req, res) => {
		const cartProxy = _getProxy(req)
		cartProxy.getCoupon(req.query.token, req.query.cartId ? req.query.cartId : null).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/** 
	 * POST delete the cart item
	 *   req.query.token - user token
	 *   body.cartItem: {
	 *	  sku: orderItem.sku, 
	 *	  qty: orderItem.qty, 
	 *	 quoteId: cartKey}
	 */
	cartApi.post('/delete', (req, res) => {
		const cartProxy = _getProxy(req)
		if (!req.body.cartItem) {
			return apiStatus(res, 'No cartItem element provided within the request body', 500)
		}
		cartProxy.delete(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.cartItem).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/** 
	 * GET pull the whole cart as it's currently se server side
	 *   req.query.token - user token
	 *   req.query.cartId - cartId
	 */
	cartApi.get('/pull', (req, res) => {
		const cartProxy = _getProxy(req)
		res.setHeader('Cache-Control', 'no-cache, no-store');
		cartProxy.pull(req.query.token, req.query.cartId ? req.query.cartId : null, req.body).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/** 
	 * GET totals the cart totals
	 *   req.query.token - user token
	 *   req.query.cartId - cartId
	 */
	cartApi.get('/totals', (req, res) => {
		const cartProxy = _getProxy(req)
		res.setHeader('Cache-Control', 'no-cache, no-store');
		cartProxy.totals(req.query.token, req.query.cartId ? req.query.cartId : null, req.body).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/**
	 * POST /shipping-methods - available shipping methods for a given address
	 *   req.query.token - user token
	 *   req.query.cartId - cart ID if user is logged in, cart token if not
	 *   req.body.address - shipping address object
	 */
	cartApi.post('/shipping-methods', (req, res) => {
		const cartProxy = _getProxy(req)
		res.setHeader('Cache-Control', 'no-cache, no-store');
		if (!req.body.address) {
			return apiStatus(res, 'No address element provided within the request body', 500)
		}
		cartProxy.getShippingMethods(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.address).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/**
	 * GET /payment-methods - available payment methods
	 *   req.query.token - user token
	 *   req.query.cartId - cart ID if user is logged in, cart token if not
	 */
	cartApi.get('/payment-methods', (req, res) => {
		const cartProxy = _getProxy(req)
		res.setHeader('Cache-Control', 'no-cache, no-store');
		cartProxy.getPaymentMethods(req.query.token, req.query.cartId ? req.query.cartId : null).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/**
	 * POST /shipping-information - set shipping information for collecting cart totals after address changed
	 *   req.query.token - user token
	 *   req.query.cartId - cart ID if user is logged in, cart token if not
	 *   req.body.addressInformation - shipping address object
	 */
	cartApi.post('/shipping-information', (req, res) => {
		const cartProxy = _getProxy(req)
		res.setHeader('Cache-Control', 'no-cache, no-store');
		if (!req.body.addressInformation) {
			return apiStatus(res, 'No address element provided within the request body', 500)
		}
		cartProxy.setShippingInformation(req.query.token, req.query.cartId ? req.query.cartId : null, req.body).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	/**
	 * POST /collect-totals - collect cart totals after shipping address changed
	 *   req.query.token - user token
	 *   req.query.cartId - cart ID if user is logged in, cart token if not
	 *   req.body.shippingMethod - shipping and payment methods object
	 */
	cartApi.post('/collect-totals', (req, res) => {
		const cartProxy = _getProxy(req)
		res.setHeader('Cache-Control', 'no-cache, no-store');
		if (!req.body.methods) {
			return apiStatus(res, 'No shipping and payment methods element provided within the request body', 500)
		}
		cartProxy.collectTotals(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.methods).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})
	})

	return cartApi
}
