/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { formatCurrency } from "../../utilities/helpers";
import { fetchAddress } from "../user/userSlice";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str
  );

function CreateOrder() {
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector(state => state.user);   //reading value from redux store
  const isLoadingAddress = addressStatus === 'loading';
  const [withPriority, setWithPriority] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const dispatch = useDispatch();
  const formErrors = useActionData()
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice
  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-semibold mb-8">Ready to order? Lets go!</h2>


      {/* <Form method="POST" action="/order/new"> */}
      <Form method="POST">
        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center ">
          <label className="sm:basis-40">First Name</label>
          <input type="text" defaultValue={username} name="customer" required className="input  grow" />
        </div>

        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input type="tel" name="phone" required className="input w-full" />
            {formErrors?.phone && (<p className="text-xs text-red-700 bg-red-100 p-2 rounded-md mt-1">{formErrors.phone}</p>)}
          </div>
        </div>

        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center relative">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              type="text"
              name="address"
              disabled={isLoadingAddress}
              defaultValue={address}
              className="input w-full"
              required />
          </div>
          {addressStatus === 'error' &&
            (<p className="text-xs text-red-700 bg-red-100 p-2 rounded-md mt-1">{errorAddress}
            </p>)}

          {!position.latitude && !position.longitude && <span className="absolute right-[3px] top-[3px] z-50 md:right-[3px] md:top-[5px]">
            <Button
              disabled={isLoadingAddress}
              type='small'
              onClick={(e) => {
                e.preventDefault();
                dispatch(fetchAddress());
              }}>Get Position</Button>
          </span>}
        </div>
        <div className="mb-12 flex items-center gap-5">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">Want to yo give your order priority?</label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input type="hidden" name="position" value={position.longitude && position.latitude ? `${position.latitude}, ${position.longitude}` : ''} />
          <Button type='primary' disabled={isSubmitting || isLoadingAddress} >{isSubmitting ? "Placing Order..." : `Order Now ${formatCurrency(totalPrice)}`}</Button>
        </div>
      </Form >
    </div >
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) //for getting form entries
  console.log(data);

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true", //to make priority true or false

  }

  const errors = {}
  if (!isValidPhone(order.phone)) errors.phone = 'Please give us your correct phone number. We might need it to contact you'
  if (Object.keys(errors).length > 0) return errors;


  //if everything is correct , create newOrder and redirect
  const newOrder = await createOrder(order);
  store.dispatch(clearCart());
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
