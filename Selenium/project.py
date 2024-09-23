from selenium import webdriver
from selenium.webdriver.common.by import By

driver_path = '/path/to/chromedriver'
driver = webdriver.Chrome(executable_path = driver_path )

driver.get('https://deshow.com/advance-search/')

driver.implicitly_wait(5)
prices = driver.find_elements(By.CLASS_NAME, 'number')

for price in prices:
    print(price.text)


driver.quit()