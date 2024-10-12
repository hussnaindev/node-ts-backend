import { AuthController } from './AuthController';
import { BookingController } from './BookingsController';
import { PaymentController } from './PaymentsController';
import { TransactionLogController } from './TransactionLogContoller';
import { UsersController } from './UsersController';
import { VehicleController } from './VehiclesController';

export const controllers = [
        AuthController,
        UsersController,
        VehicleController,
        BookingController,
        PaymentController,
        TransactionLogController,
];
