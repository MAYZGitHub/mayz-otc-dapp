import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import classNames from 'classnames';
import styles from './Drawer.module.scss';

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
    <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>>(
    ({ className, ...props }, ref) => <DrawerPrimitive.Overlay ref={ref} className={classNames(styles.overlay, className)} {...props} />
);
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerTitle = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>>(
    ({ className, ...props }, ref) => <DrawerPrimitive.Title ref={ref} className={classNames(styles.sronly, className)} {...props} />
);
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>>(
    ({ className, ...props }, ref) => <DrawerPrimitive.Description ref={ref} className={classNames(styles.sronly, className)} {...props} />
);
DrawerDescription.displayName = 'DrawerDescription';

const DrawerContent = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>>(
    ({ className, children, ...props }, ref) => (
        <DrawerPortal>
            <DrawerOverlay />
            <DrawerPrimitive.Content ref={ref} className={classNames(styles.drawerContentWrapper, className)} {...props}>
                <DrawerTitle asChild>
                    <h2 className={styles.sronly}>Wallet Modal</h2>
                </DrawerTitle>
                <DrawerDescription asChild>
                    <p className={styles.sronly}>Use this modal to connect and manage your Cardano wallet.</p>
                </DrawerDescription>
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    )
);
DrawerContent.displayName = 'DrawerContent';

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger };
